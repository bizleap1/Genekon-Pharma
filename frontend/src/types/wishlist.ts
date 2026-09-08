import { Product } from "./product";

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface WishlistState {
  items: Product[];
}
