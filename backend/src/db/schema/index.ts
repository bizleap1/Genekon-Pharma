import { relations } from "drizzle-orm";
import { users } from "./users";
import { userAddresses } from "./addresses";
import { refreshTokens } from "./refreshTokens";
import { categories } from "./categories";
import { products } from "./products";
import { productImages } from "./productImages";
import { carts, cartItems } from "./cart";
import { wishlists } from "./wishlist";
import { prescriptions } from "./prescriptions";
import { orders } from "./orders";
import { orderItems } from "./orderItems";
import { orderStatusHistory } from "./orderStatusHistory";

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
export * from "./prescriptions";
export * from "./orders";
export * from "./orderItems";
export * from "./orderStatusHistory";

// Users Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  addresses: many(userAddresses),
  refreshTokens: many(refreshTokens),
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  wishlist: many(wishlists),
  orders: many(orders),
  prescriptions: many(prescriptions),
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
  orderItems: many(orderItems),
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

// Prescriptions Relations
export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  user: one(users, {
    fields: [prescriptions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [prescriptions.orderId],
    references: [orders.id],
  }),
  reviewer: one(users, {
    fields: [prescriptions.reviewedBy],
    references: [users.id],
  }),
}));

// Orders Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  deliveryAddress: one(userAddresses, {
    fields: [orders.deliveryAddressId],
    references: [userAddresses.id],
  }),
  prescription: one(prescriptions, {
    fields: [orders.prescriptionId],
    references: [prescriptions.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

// Order Items Relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Order Status History Relations
export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  updatedByUser: one(users, {
    fields: [orderStatusHistory.updatedBy],
    references: [users.id],
  }),
}));

