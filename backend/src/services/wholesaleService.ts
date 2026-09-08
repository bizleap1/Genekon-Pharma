import { eq, desc, and } from "drizzle-orm";
import { db, wholesaleProfiles, users } from "../db";
import { activityLogService } from "./activityLogService";
import { logger } from "../utils/logger";

export interface RegisterWholesaleInput {
  businessName: string;
  ownerName: string;
  businessType: "RETAIL_PHARMACY" | "CLINIC_NURSING_HOME" | "HOSPITAL" | "DISTRIBUTOR";
  gstNumber: string;
  drugLicenseNumber: string;
  drugLicenseExpiry?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ReviewApplicationInput {
  decision: "APPROVED" | "REJECTED";
  rejectionReason?: string;
  creditLimit?: number;
}

export const wholesaleService = {
  /**
   * 1. Register a wholesale partner application
   */
  async registerPartner(userId: string, input: RegisterWholesaleInput) {
    // Check if profile already exists for this user
    const [existing] = await db
      .select()
      .from(wholesaleProfiles)
      .where(eq(wholesaleProfiles.userId, userId))
      .limit(1);

    if (existing) {
      if (existing.status === "APPROVED") {
        throw new Error("You are already an approved wholesale partner");
      }
      if (existing.status === "PENDING_VERIFICATION") {
        throw new Error("Your wholesale partner application is already under review");
      }
    }

    const [created] = await db
      .insert(wholesaleProfiles)
      .values({
        userId,
        businessName: input.businessName.trim(),
        ownerName: input.ownerName.trim(),
        businessType: input.businessType,
        gstNumber: input.gstNumber.trim().toUpperCase(),
        drugLicenseNumber: input.drugLicenseNumber.trim().toUpperCase(),
        drugLicenseExpiry: input.drugLicenseExpiry ? new Date(input.drugLicenseExpiry) : null,
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        address: input.address.trim(),
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
        pincode: input.pincode?.trim() || null,
        status: "PENDING_VERIFICATION",
      })
      .returning();

    logger.info(`Wholesale partner application submitted for ${created.businessName} (User: ${userId})`);
    return created;
  },

  /**
   * 2. Admin: List all wholesale applications with status filter
   */
  async listApplications(status?: string) {
    const conditions: any[] = [];
    if (status) {
      conditions.push(eq(wholesaleProfiles.status, status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const applications = await db
      .select({
        profile: wholesaleProfiles,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          currentRole: users.role,
        },
      })
      .from(wholesaleProfiles)
      .leftJoin(users, eq(wholesaleProfiles.userId, users.id))
      .where(whereClause)
      .orderBy(desc(wholesaleProfiles.createdAt));

    return applications.map((a) => ({
      ...a.profile,
      user: a.user,
    }));
  },

  /**
   * 3. Admin: Review and approve or reject wholesale application
   */
  async reviewApplication(adminId: string, applicationId: string, input: ReviewApplicationInput) {
    const [application] = await db
      .select()
      .from(wholesaleProfiles)
      .where(eq(wholesaleProfiles.id, applicationId))
      .limit(1);

    if (!application) {
      throw new Error("Wholesale application not found");
    }

    const isApprove = input.decision === "APPROVED";
    const nextStatus = isApprove ? "APPROVED" : "REJECTED";

    // 1. Update wholesale profile
    const [updatedProfile] = await db
      .update(wholesaleProfiles)
      .set({
        status: nextStatus,
        rejectionReason: !isApprove ? input.rejectionReason || "Application rejected by dispensary compliance" : null,
        creditLimit: isApprove && input.creditLimit ? input.creditLimit.toFixed(2) : application.creditLimit,
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(wholesaleProfiles.id, applicationId))
      .returning();

    // 2. If approved, automatically elevate user role to WHOLESALE_PARTNER
    if (isApprove) {
      await db
        .update(users)
        .set({
          role: "WHOLESALE_PARTNER",
          updatedAt: new Date(),
        })
        .where(eq(users.id, application.userId));
    }

    // 3. Log admin activity
    await activityLogService.log({
      adminId,
      action: isApprove ? "WHOLESALE_APPROVED" : "WHOLESALE_REJECTED",
      module: "WHOLESALE",
      targetId: applicationId,
      details: {
        businessName: application.businessName,
        gstNumber: application.gstNumber,
        decision: input.decision,
        creditLimit: input.creditLimit,
      },
    });

    logger.info(`Admin ${adminId} ${isApprove ? "approved" : "rejected"} wholesale partner ${application.businessName}`);

    return {
      success: true,
      message: `Wholesale partner application ${input.decision.toLowerCase()} successfully`,
      profile: updatedProfile,
    };
  },

  /**
   * 4. Admin: List verified wholesale partners
   */
  async listPartners() {
    return this.listApplications("APPROVED");
  },

  /**
   * 5. Get partner profile by User ID
   */
  async getProfileByUserId(userId: string) {
    const [profile] = await db
      .select()
      .from(wholesaleProfiles)
      .where(eq(wholesaleProfiles.userId, userId))
      .limit(1);
    return profile || null;
  },
};
