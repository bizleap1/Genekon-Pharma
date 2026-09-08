import { relations } from "drizzle-orm";
import { users } from "./users";
import { userAddresses } from "./addresses";
import { refreshTokens } from "./refreshTokens";
import { categories } from "./categories";
import { products } from "./products";
import { productImages } from "./productImages";
import { carts, cartItems } from "./cart";
import { wishlists } from "./wishlist";

export * from "./enums";
export * from "./users";
export * from "./addresses";
export * from "./otps";
export * from "./refreshTokens";
export * from "./categories";
export * from "./products";
export * from "./productImages";
export * from "./cart";
export * from "./wishlist";

// Users Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  addresses: many(userAddresses),
  refreshTokens: many(refreshTokens),
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  wishlist: many(wishlists),
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
  cartItems: many(cartItems),
  wishlists: many(wishlists),
}));

// Product Images Relations
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Cart Relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

// Cart Items Relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Wishlist Relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));
