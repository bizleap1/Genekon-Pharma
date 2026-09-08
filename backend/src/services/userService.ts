import { eq, and } from "drizzle-orm";
import { db, users, userAddresses, NewUserAddress } from "../db";

export const userService = {
  /**
   * Get User Profile
   */
  async getProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new Error("User not found");
    }

    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      mobile: user.phone,
      role: user.role,
      avatar: user.profileDetails?.avatar,
      dateOfBirth: user.profileDetails?.dateOfBirth,
      gender: user.profileDetails?.gender,
      businessName: user.profileDetails?.businessName,
      gstNumber: user.profileDetails?.gstNumber,
      addresses,
    };
  },

  /**
   * Update Profile Details
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: string;
      avatar?: string;
      businessName?: string;
      gstNumber?: string;
    }
  ) {
    const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!existing) {
      throw new Error("User not found");
    }

    const updatedProfileDetails = {
      ...existing.profileDetails,
      ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
      ...(data.gender && { gender: data.gender }),
      ...(data.avatar && { avatar: data.avatar }),
      ...(data.businessName && { businessName: data.businessName }),
      ...(data.gstNumber && { gstNumber: data.gstNumber }),
    };

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        profileDetails: updatedProfileDetails,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return this.getProfile(updatedUser.id);
  },

  /**
   * Get Saved Addresses
   */
  async getAddresses(userId: string) {
    return await db.select().from(userAddresses).where(eq(userAddresses.userId, userId));
  },

  /**
   * Add Delivery Address
   */
  async addAddress(userId: string, data: Omit<NewUserAddress, "userId" | "id">) {
    if (data.isDefault) {
      // Clear existing default flags
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, userId));
    }

    const [newAddress] = await db
      .insert(userAddresses)
      .values({
        ...data,
        userId,
      })
      .returning();

    return newAddress;
  },

  /**
   * Update Delivery Address
   */
  async updateAddress(userId: string, addressId: string, data: Partial<NewUserAddress>) {
    const [existing] = await db
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error("Address not found or does not belong to user");
    }

    if (data.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, userId));
    }

    const [updated] = await db
      .update(userAddresses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userAddresses.id, addressId))
      .returning();

    return updated;
  },

  /**
   * Delete Delivery Address
   */
  async deleteAddress(userId: string, addressId: string) {
    const [existing] = await db
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error("Address not found or does not belong to user");
    }

    await db.delete(userAddresses).where(eq(userAddresses.id, addressId));
    return { id: addressId };
  },
};
