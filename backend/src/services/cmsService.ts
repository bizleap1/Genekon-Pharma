import { eq, desc, and, asc } from "drizzle-orm";
import { db, cmsBanners } from "../db";
import { activityLogService } from "./activityLogService";
import { logger } from "../utils/logger";

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl?: string;
  section?: string;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerInput {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  targetUrl?: string;
  section?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export const cmsService = {
  /**
   * 1. List banners (Admin view returns all; public view returns active ones)
   */
  async listBanners(isAdmin = false, section?: string) {
    const conditions: any[] = [];
    if (!isAdmin) {
      conditions.push(eq(cmsBanners.isActive, true));
    }
    if (section) {
      conditions.push(eq(cmsBanners.section, section));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return db
      .select()
      .from(cmsBanners)
      .where(whereClause)
      .orderBy(asc(cmsBanners.displayOrder), desc(cmsBanners.createdAt));
  },

  /**
   * 2. Create banner
   */
  async createBanner(adminId: string, input: CreateBannerInput) {
    const [created] = await db
      .insert(cmsBanners)
      .values({
        title: input.title,
        subtitle: input.subtitle || null,
        imageUrl: input.imageUrl,
        targetUrl: input.targetUrl || null,
        section: input.section || "HOMEPAGE_HERO",
        displayOrder: input.displayOrder || 0,
        isActive: true,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
      })
      .returning();

    await activityLogService.log({
      adminId,
      action: "BANNER_CREATED",
      module: "CMS",
      targetId: created.id,
      details: { title: created.title, section: created.section },
    });

    logger.info(`Banner '${created.title}' created by admin ${adminId}`);
    return created;
  },

  /**
   * 3. Update banner
   */
  async updateBanner(adminId: string, id: string, input: UpdateBannerInput) {
    const [banner] = await db.select().from(cmsBanners).where(eq(cmsBanners.id, id)).limit(1);
    if (!banner) {
      throw new Error("Banner not found");
    }

    const updateData: any = { updatedAt: new Date() };
    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.targetUrl !== undefined) updateData.targetUrl = input.targetUrl;
    if (input.section !== undefined) updateData.section = input.section;
    if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;

    const [updated] = await db
      .update(cmsBanners)
      .set(updateData)
      .where(eq(cmsBanners.id, id))
      .returning();

    await activityLogService.log({
      adminId,
      action: "BANNER_UPDATED",
      module: "CMS",
      targetId: id,
      details: updateData,
    });

    return updated;
  },

  /**
   * 4. Toggle banner status
   */
  async toggleBannerStatus(adminId: string, id: string, isActive: boolean) {
    const [updated] = await db
      .update(cmsBanners)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(cmsBanners.id, id))
      .returning();

    if (!updated) {
      throw new Error("Banner not found");
    }

    await activityLogService.log({
      adminId,
      action: isActive ? "BANNER_ENABLED" : "BANNER_DISABLED",
      module: "CMS",
      targetId: id,
      details: { title: updated.title, isActive },
    });

    return updated;
  },

  /**
   * 5. Delete banner
   */
  async deleteBanner(adminId: string, id: string) {
    const [deleted] = await db.delete(cmsBanners).where(eq(cmsBanners.id, id)).returning();
    if (!deleted) {
      throw new Error("Banner not found");
    }

    await activityLogService.log({
      adminId,
      action: "BANNER_DELETED",
      module: "CMS",
      targetId: id,
      details: { title: deleted.title },
    });

    return { success: true, message: `Banner '${deleted.title}' deleted successfully` };
  },
};
