import { authService } from "../services/authService";
import { logger } from "../utils/logger";

async function runGoogleAuthTest() {
  console.log("==================================================");
  console.log("🔍 TESTING GOOGLE AUTHENTICATION INTEGRATION");
  console.log("==================================================");

  try {
    const mockToken = `mock_google_token_${Date.now()}`;
    console.log("Step 1: Testing loginWithGoogle using dev/demo token...");
    const result = await authService.loginWithGoogle(mockToken);

    console.log("✅ Google Auth Successful!");
    console.log(`- User ID: ${result.user.id}`);
    console.log(`- Name: ${result.user.name}`);
    console.log(`- Email: ${result.user.email}`);
    console.log(`- Role: ${result.user.role}`);
    console.log(`- Access Token generated: ${result.tokens.accessToken.substring(0, 20)}...`);
    console.log(`- Refresh Token generated: ${result.tokens.refreshToken.substring(0, 20)}...`);
    console.log("==================================================");
    console.log("🎉 GOOGLE AUTH BACKEND INTEGRATION TEST PASSED!");
    console.log("==================================================");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Google Auth Test Failed:", err);
    process.exit(1);
  }
}

runGoogleAuthTest();
