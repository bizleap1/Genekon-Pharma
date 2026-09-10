import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined);

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

export const googleAuthService = {
  /**
   * Verify Google OAuth ID Token
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleUserProfile> {
    try {
      // In development / demo mode, allow mock token simulation only if strictly non-production
      if (idToken.startsWith("mock_google_token_")) {
        if (env.NODE_ENV === "production") {
          throw new Error("Mock Google authentication tokens are strictly forbidden in production");
        }
        return {
          googleId: `google_${Date.now()}`,
          email: "google.user@example.com",
          name: "Google Verified Customer",
          avatar: "https://lh3.googleusercontent.com/a/default-user",
        };
      }

      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error("Invalid Google token payload");
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || "Customer",
        avatar: payload.picture,
      };
    } catch (error: any) {
      logger.error("Google token verification failed", error);
      throw new Error("Failed to verify Google account credentials");
    }
  },
};
