import { relations } from "drizzle-orm";
import { users } from "./users";
import { userAddresses } from "./addresses";
import { refreshTokens } from "./refreshTokens";
import { categories } from "./categories";
import { products } from "./products";
import { productImages } from "./productImages";

export * from "./enums";
export * from "./users";
export * from "./addresses";
export * from "./otps";
export * from "./refreshTokens";
export * from "./categories";
export * from "./products";
export * from "./productImages";

// Users Relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(userAddresses),
  refreshTokens: many(refreshTokens),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// Categories Relations (Self-referencing tree & products)
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  subCategories: many(categories, {
    relationName: "categoryHierarchy",
  }),
  products: many(products),
}));

// Products Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}));

// Product Images Relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
