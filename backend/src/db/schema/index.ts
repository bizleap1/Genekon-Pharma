import { relations } from "drizzle-orm";
import { users } from "./users";
import { userAddresses } from "./addresses";
import { refreshTokens } from "./refreshTokens";

export * from "./enums";
export * from "./users";
export * from "./addresses";
export * from "./otps";
export * from "./refreshTokens";

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
