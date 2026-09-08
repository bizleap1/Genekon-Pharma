"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlist.forEach((p) => {
      addToCart(p, 1);
    });
    clearWishlist();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-8 sm:py-12">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-6">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">My Wishlist</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#E3EDE1] gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2">
                <Heart className="w-3.5 h-3.5 fill-[#559620] text-[#559620]" />
                <span>SAVED HEALTHCARE ITEMS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] font-bold">
                My Wishlist ({wishlist.length} {wishlist.length === 1 ? "Item" : "Items"})
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {wishlist.length > 0 && (
                <>
                  <button
                    onClick={handleMoveAllToCart}
                    className="px-4 py-2 rounded-xl bg-[#1853A8] hover:bg-[#123E7F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move All to Cart</span>
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#637766] hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </>
              )}

              <Link
                href="/products"
                className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs"
              >
                Browse Medicines &rarr;
              </Link>
            </div>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#C5D6C7] bg-white p-12 text-center max-w-md mx-auto my-6 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-[#EDF7E9] text-[#559620] flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#14304A]">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-[#637766] max-w-xs mx-auto mt-1 mb-5 leading-relaxed">
                Save your favorite medicines, vitamins, and healthcare essentials here for easy 1-click ordering.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
