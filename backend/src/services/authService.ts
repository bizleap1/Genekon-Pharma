import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, users, User } from "../db";
import { tokenService, AuthTokens } from "./tokenService";
import { otpService } from "./otpService";
import { googleAuthService } from "./googleAuthService";
import { logger } from "../utils/logger";

export interface AuthSuccessResult {
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: "CUSTOMER" | "WHOLESALE_PARTNER" | "ADMIN";
    avatar?: string;
    profileDetails?: Record<string, unknown>;
  };
  tokens: AuthTokens;
}

export const authService = {
  /**
   * Format user object for client response
   */
  formatUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.profileDetails?.avatar,
      profileDetails: user.profileDetails,
    };
  },

  /**
   * Send OTP to phone or email
   */
  async requestOtp(identifier: string) {
    return await otpService.sendOtp(identifier);
  },

  /**
   * Verify OTP and Login / Provision Customer Account
   */
  async verifyOtpAndLogin(
    identifier: string,
    plainOtp: string,
    role: "CUSTOMER" | "WHOLESALE_PARTNER" = "CUSTOMER"
  ): Promise<AuthSuccessResult> {
    // 1. Verify OTP with attempt lockout
    await otpService.verifyOtp(identifier, plainOtp);

    const cleanId = identifier.trim().toLowerCase();
    const isEmail = cleanId.includes("@");

    // 2. Find existing user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(isEmail ? eq(users.email, cleanId) : eq(users.phone, cleanId))
      .limit(1);

    let user: User;

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new Error("This account has been deactivated. Please contact customer support.");
      }
      user = existingUser;
    } else {
      // 3. Auto-provision new customer account - always CUSTOMER role. Wholesale requires application & approval.
      const [newUser] = await db
        .insert(users)
        .values({
          name: isEmail ? cleanId.split("@")[0] : `Customer ${cleanId.slice(-4)}`,
          email: isEmail ? cleanId : null,
          phone: !isEmail ? cleanId : null,
          role: "CUSTOMER",
          isActive: true,
          profileDetails: {
            avatar: "/images/avatars/user-default.png",
          },
        })
        .returning();

      user = newUser;
      logger.info(`Auto-provisioned new CUSTOMER account via OTP: ${user.id} (${identifier})`);
    }

    // 4. Generate JWT Access and Refresh tokens
    const tokens = await tokenService.generateAuthTokens(user);

    return {
      user: this.formatUser(user),
      tokens,
    };
  },

  /**
   * Register with Mobile + Password
   */
  async register(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role?: "CUSTOMER" | "WHOLESALE_PARTNER";
    profileDetails?: Record<string, unknown>;
  }): Promise<AuthSuccessResult> {
    if ((data.role as string) === "ADMIN") {
      throw new Error("Admin registration is not permitted via public endpoint");
    }

    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email?.trim().toLowerCase();

    // 1. Check duplicate
    const existing = await db
      .select()
      .from(users)
      .where(
        cleanEmail
          ? or(eq(users.phone, cleanPhone), eq(users.email, cleanEmail))
          : eq(users.phone, cleanPhone)
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("An account with this mobile number or email already exists");
    }

    // 2. Hash password with bcrypt
    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;

    const assignedRole = data.role === "WHOLESALE_PARTNER" ? "WHOLESALE_PARTNER" : "CUSTOMER";

    // 3. Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        phone: cleanPhone,
        email: cleanEmail || null,
        passwordHash,
        role: assignedRole,
        profileDetails: data.profileDetails || {},
        isActive: true,
      })
      .returning();

    const tokens = await tokenService.generateAuthTokens(newUser);

    return {
      user: this.formatUser(newUser),
      tokens,
    };
  },

  /**
   * Password Login (For Admins and Wholesale Partners)
   */
  async loginWithPassword(identifier: string, plainPassword: string): Promise<AuthSuccessResult> {
    const cleanId = identifier.trim().toLowerCase();
    const isEmail = cleanId.includes("@");

    const [user] = await db
      .select()
      .from(users)
      .where(isEmail ? eq(users.email, cleanId) : eq(users.phone, cleanId))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new Error("Invalid mobile/email or password");
    }

    if (!user.isActive) {
      throw new Error("This account is inactive. Please contact administrator.");
    }

    const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid mobile/email or password");
    }

    const tokens = await tokenService.generateAuthTokens(user);

    return {
      user: this.formatUser(user),
      tokens,
    };
  },

  /**
   * Google OAuth Login / Provisioning
   */
  async loginWithGoogle(idToken: string): Promise<AuthSuccessResult> {
    const googleProfile = await googleAuthService.verifyGoogleToken(idToken);

    // Find by googleId or email
    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.googleId, googleProfile.googleId), eq(users.email, googleProfile.email)))
      .limit(1);

    let user: User;

    if (existing) {
      if (!existing.isActive) {
        throw new Error("Account has been deactivated.");
      }
      // Link googleId if not yet linked
      if (!existing.googleId) {
        const [updated] = await db
          .update(users)
          .set({
            googleId: googleProfile.googleId,
            profileDetails: {
              ...existing.profileDetails,
              avatar: existing.profileDetails?.avatar || googleProfile.avatar,
            },
          })
          .where(eq(users.id, existing.id))
          .returning();
        user = updated;
      } else {
        user = existing;
      }
    } else {
      // Create new customer
      const [created] = await db
        .insert(users)
        .values({
          name: googleProfile.name,
          email: googleProfile.email,
          googleId: googleProfile.googleId,
          role: "CUSTOMER",
          isActive: true,
          profileDetails: {
            avatar: googleProfile.avatar,
          },
        })
        .returning();
      user = created;
    }

    const tokens = await tokenService.generateAuthTokens(user);

    return {
      user: this.formatUser(user),
      tokens,
    };
  },

  /**
   * Token Refresh Rotation
   */
  async refreshAccessToken(oldRefreshToken: string) {
    const result = await tokenService.rotateRefreshToken(oldRefreshToken);
    return {
      user: this.formatUser(result.user),
      tokens: result.tokens,
    };
  },

  /**
   * Invalidate Refresh Token on Logout
   */
  async logout(refreshToken: string) {
    await tokenService.revokeRefreshToken(refreshToken);
  },
};
