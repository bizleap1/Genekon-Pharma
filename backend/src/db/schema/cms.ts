import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const cmsBanners = pgTable(
  "cms_banners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    targetUrl: varchar("target_url", { length: 500 }),
    section: varchar("section", { length: 100 }).default("HOMEPAGE_HERO").notNull(), // HOMEPAGE_HERO, PROMO_STRIP, OFFER_CAROUSEL
    displayOrder: integer("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).defaultNow(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cms_banners_section").on(table.section),
    index("idx_cms_banners_is_active").on(table.isActive),
    index("idx_cms_banners_display_order").on(table.displayOrder),
  ]
);

export type CmsBanner = typeof cmsBanners.$inferSelect;
export type NewCmsBanner = typeof cmsBanners.$inferInsert;
