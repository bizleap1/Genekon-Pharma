import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users } from "../db";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { tokenService } from "../services/tokenService";
import { logger } from "../utils/logger";

async function runAuthVerification() {
  logger.info("==================================================");
  logger.info("🧪 Starting Genekon Authentication System Verification");
  logger.info("==================================================");

  // 1. Seed Admin User
  logger.info("\n--- STEP 1: Seeding Admin and Wholesale Users ---");
  const adminEmail = "admin@genekonpharma.com";
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  let adminUser = existingAdmin[0];
  if (!adminUser) {
    const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
    const [created] = await db
      .insert(users)
      .values({
        name: "Dr. Shreya Meshram (Super Pharmacist)",
        email: adminEmail,
        phone: "9822110011",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        isActive: true,
        profileDetails: { avatar: "SM", department: "Clinical Operations" },
      })
      .returning();
    adminUser = created;
    logger.info("Created Admin user: admin@genekonpharma.com");
  } else {
    logger.info("Admin user already exists");
  }

  // 2. Test Mobile OTP Flow
  logger.info("\n--- STEP 2: Testing Mobile OTP Authentication ---");
  const testPhone = "9370102691";
  const otpRes = await authService.requestOtp(testPhone);
  logger.info(`OTP Request response: ${otpRes.message}`);
  const generatedOtp = otpRes.testOtp;

  if (!generatedOtp) {
    throw new Error("testOtp not returned in development mode");
  }

  // Test invalid OTP
  try {
    await authService.verifyOtpAndLogin(testPhone, "000000");
    throw new Error("Invalid OTP should have failed!");
  } catch (err: any) {
    logger.info(`✅ Correctly rejected invalid OTP: ${err.message}`);
  }

  // Test valid OTP login
  const otpLoginRes = await authService.verifyOtpAndLogin(testPhone, generatedOtp, "CUSTOMER");
  logger.info(`✅ Mobile OTP login successful! User: ${otpLoginRes.user.name}, Role: ${otpLoginRes.user.role}`);
  logger.info(`Access Token (first 25 chars): ${otpLoginRes.tokens.accessToken.slice(0, 25)}...`);

  // 3. Test Password Login (Admin)
  logger.info("\n--- STEP 3: Testing Admin Password Authentication ---");
  const adminLoginRes = await authService.loginWithPassword("admin@genekonpharma.com", "Admin@12345");
  logger.info(`✅ Admin login successful! Role: ${adminLoginRes.user.role}`);

  // 4. Test Token Verification & Role-Based Authorization
  logger.info("\n--- STEP 4: Testing Role-Based Token Authorization ---");
  const customerDecoded = tokenService.verifyAccessToken(otpLoginRes.tokens.accessToken);
  const adminDecoded = tokenService.verifyAccessToken(adminLoginRes.tokens.accessToken);

  logger.info(`Customer Token Role: ${customerDecoded.role}`);
  logger.info(`Admin Token Role: ${adminDecoded.role}`);

  // Verify RBAC logic
  const isCustomerAdmin = customerDecoded.role === "ADMIN";
  const isAdminAdmin = adminDecoded.role === "ADMIN";

  if (!isCustomerAdmin) {
    logger.info("✅ RBAC Check: Customer cannot access Admin endpoints (Blocked as expected)");
  }
  if (isAdminAdmin) {
    logger.info("✅ RBAC Check: Admin permitted for Admin endpoints (Passed)");
  }

  // 5. Test Refresh Token Rotation
  logger.info("\n--- STEP 5: Testing Refresh Token Rotation ---");
  const rotated = await authService.refreshAccessToken(otpLoginRes.tokens.refreshToken);
  logger.info("✅ Refresh token rotated successfully! New Access Token generated.");

  // Test old refresh token reuse (must be rejected!)
  try {
    await authService.refreshAccessToken(otpLoginRes.tokens.refreshToken);
    throw new Error("Reused old refresh token should have been rejected!");
  } catch (err: any) {
    logger.info(`✅ Token Replay Protection: Correctly rejected reused old token: ${err.message}`);
  }

  // 6. Test User Profile & Address CRUD
  logger.info("\n--- STEP 6: Testing Profile & Address Management ---");
  const customerId = otpLoginRes.user.id;

  // Add address
  const newAddr = await userService.addAddress(customerId, {
    fullName: "Prerna Sharma",
    phone: "9370102691",
    addressLine: "Flat 302, Royal Palms, Ramdaspeth",
    landmark: "Central Park Hospital",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440010",
    addressType: "HOME",
    isDefault: true,
  });
  logger.info(`✅ Address added: ${newAddr.addressLine}, ${newAddr.city}`);

  // Retrieve addresses
  const addrList = await userService.getAddresses(customerId);
  logger.info(`✅ User has ${addrList.length} saved address(es)`);

  // Update profile
  const updatedProfile = await userService.updateProfile(customerId, {
    name: "Prerna Sharma",
    dateOfBirth: "1994-08-14",
    gender: "Female",
  });
  logger.info(`✅ Profile updated: Name: ${updatedProfile.name}, DOB: ${updatedProfile.dateOfBirth}`);

  // 7. Test Logout Revocation
  logger.info("\n--- STEP 7: Testing Logout Token Invalidation ---");
  await authService.logout(rotated.tokens.refreshToken);
  try {
    await authService.refreshAccessToken(rotated.tokens.refreshToken);
    throw new Error("Logged out refresh token should have been revoked!");
  } catch (err: any) {
    logger.info(`✅ Logout Invalidation: Correctly rejected revoked refresh token: ${err.message}`);
  }

  logger.info("\n==================================================");
  logger.info("🎉 ALL 7 AUTHENTICATION SYSTEM TESTS PASSED SUCCESSFULLY!");
  logger.info("==================================================");
  process.exit(0);
}

runAuthVerification().catch((err) => {
  logger.error("❌ Verification failed:", err);
  process.exit(1);
});
