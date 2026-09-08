"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  Heart,
  ArrowRight,
  ShieldCheck,
  Tag,
  MessageCircle,
  ChevronRight,
  Gift,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { CartItem } from "@/types/cart";
import { AVAILABLE_COUPONS } from "@/services/cartService";

const RECOMMENDED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Cipla Paracetamol 500 mg",
    brand: "Cipla",
    variant: "10 Tablets",
    discount: 20,
    rating: 4.6,
    price: 32,
    originalPrice: 40,
    stockQuantity: 145,
    image: "/images/products/cipla-paracetamol-v2.jpg",
  },
  {
    id: "prod-5",
    name: "Accu-Chek Blood Glucose Strips",
    brand: "Accu-Chek",
    variant: "50 Strips",
    discount: 15,
    rating: 4.4,
    price: 1199,
    originalPrice: 1350,
    stockQuantity: 58,
    image: "/images/products/accu-chek-strips-v2.jpg",
  },
  {
    id: "prod-8",
    name: "Optimum Nutrition Whey Protein",
    brand: "Optimum Nutrition",
    variant: "1 kg",
    discount: 20,
    rating: 4.5,
    price: 2399,
    originalPrice: 2999,
    stockQuantity: 8,
    image: "/images/products/optimum-nutrition-protein-v2.jpg",
  },
];

export default function CartPage() {
  const {
    items,
    totals,
    updateQuantity,
    removeFromCart,
    toggleItemSelection,
    selectAllItems,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    addToCart,
  } = useCart();

  const { addToWishlist } = useWishlist();
  const toast = useToast();
  const router = useRouter();
  const { requireAuth } = useAuthGuard();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const handleToggleSelectAll = () => {
    selectAllItems(!allSelected);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const target = (codeToApply || couponCode).trim().toUpperCase();
    if (!target) return;
    setCouponError("");
    setCouponSuccess("");
    const res = applyCoupon(target);
    if (!res.success) {
      setCouponError(res.message);
      toast.error(res.message);
    } else {
      setCouponSuccess(res.message);
      setCouponCode("");
      toast.success(res.message);
    }
  };

  const handleIncreaseQty = (item: CartItem) => {
    const max = item.stockQuantity || 99;
    if (item.quantity >= max) {
      toast.warning(`Only ${max} units available in stock.`);
      return;
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecreaseQty = (item: CartItem) => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleSaveForLater = (item: CartItem) => {
    addToWishlist({
      id: item.productId,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      image: item.image,
      images: [item.image],
      category: "Medicines",
      dosageForm: item.variant,
      inStock: true,
      stockStatus: "In Stock",
      stockQuantity: item.stockQuantity || 50,
      prescriptionRequired: item.prescriptionRequired || false,
      mrp: item.mrp || item.originalPrice,
      rating: 4.5,
      composition: "",
      description: "",
      variants: [],
      quantity: 1,
    });
    removeFromCart(item.id);
    toast.info(`Moved "${item.name}" to Wishlist.`);
  };

  const handleRemoveSelected = () => {
    items.filter((i) => i.selected).forEach((i) => removeFromCart(i.id));
    toast.info("Removed selected items from cart.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-6 sm:py-8">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-4">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">Cart</span>
          </nav>

          {/* Cart Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-4 border-b border-[#E3EDE1] gap-2">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                Your Cart{" "}
                <span className="text-[#559620] font-sans text-xl">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#556958] mt-1">
                Review your medicines and healthcare products before checkout
              </p>
            </div>

            <Link
              href="/medicines"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1853A8] hover:underline"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="rounded-3xl border border-[#E0ECE0] bg-white p-10 sm:p-14 text-center my-8 max-w-lg mx-auto shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-[#EDF7E9] text-[#559620] flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl text-[#14304A]">Your cart is empty</h2>
              <p className="text-xs sm:text-sm text-[#697C6B] mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
                Explore our catalog of genuine prescription medicines, vitamins, and wellness essentials.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/medicines"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors shadow-xs"
                >
                  <span>Browse All Medicines</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/prescription/upload"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#CCDCCD] bg-white hover:bg-[#F4FAF1] text-[#14304A] text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors"
                >
                  <span>Upload Prescription</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Main Cart Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Cart Items & Free Delivery Progress */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Select All / Remove Strip */}
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white border border-[#E3EDE1] text-xs text-[#14304A] font-semibold shadow-2xs">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#559620] focus:ring-[#559620] cursor-pointer"
                    />
                    <span>
                      Select All Items ({totals.itemCount} selected)
                    </span>
                  </label>

                  {items.some((i) => i.selected) && (
                    <button
                      onClick={handleRemoveSelected}
                      className="inline-flex items-center gap-1 text-xs text-[#7B8F7D] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Selected</span>
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const isAtStockLimit = item.stockQuantity > 0 && item.quantity >= item.stockQuantity;

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border transition-all shadow-2xs gap-4 ${
                          item.selected
                            ? "border-[#E3EDE1] hover:border-[#559620]/40"
                            : "border-[#ECEFEA] opacity-70 bg-[#FAFCFB]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 w-full sm:w-auto">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-[#559620] focus:ring-[#559620] cursor-pointer shrink-0"
                            aria-label={`Select ${item.name}`}
                          />

                          {/* Product Thumbnail */}
                          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-[#FAFCFB] border border-[#EBF3E8] p-1.5 shrink-0 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-contain"
                            />
                          </div>

                          {/* Item Details */}
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {item.discount > 0 && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EDF7E9] text-[#559620]">
                                  {item.discount}% OFF
                                </span>
                              )}
                              {item.stockQuantity > 0 && item.stockQuantity <= 10 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Only {item.stockQuantity} left
                                </span>
                              )}
                            </div>

                            <h3 className="text-xs sm:text-sm font-bold text-[#14304A] line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-[11px] text-[#6E8070] mt-0.5">
                              {item.variant} &bull; {item.brand}
                            </p>

                            <div className="flex items-baseline gap-2 mt-1.5">
                              <span className="text-sm sm:text-base font-extrabold text-[#14304A]">
                                ₹{item.price}
                              </span>
                              <span className="text-xs text-[#8E9F90] line-through">
                                ₹{item.originalPrice}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Controls: Quantity & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0F5EE]">
                          {/* Quantity Buttons */}
                          <div className="flex items-center rounded-xl border border-[#D5E6D3] bg-[#FAFCFB] overflow-hidden">
                            <button
                              onClick={() => handleDecreaseQty(item)}
                              className="w-8 h-8 flex items-center justify-center text-[#556958] hover:bg-[#EDF7E9] hover:text-[#559620] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[#14304A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncreaseQty(item)}
                              disabled={isAtStockLimit}
                              className={`w-8 h-8 flex items-center justify-center transition-colors ${
                                isAtStockLimit
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-[#556958] hover:bg-[#EDF7E9] hover:text-[#559620] cursor-pointer"
                              }`}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Save to Wishlist Button */}
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="inline-flex items-center gap-1 text-xs text-[#6F8271] hover:text-[#1853A8] transition-colors p-1.5 cursor-pointer"
                            title="Move to Wishlist"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="hidden sm:inline text-[11px]">Save</span>
                          </button>

                          {/* Remove Trash Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex items-center gap-1 text-xs text-[#7B8F7D] hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Free Delivery Banner */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F0F8EC] border border-[#D5EAD0] text-xs">
                  <div className="flex items-center gap-2.5 text-[#3D5240]">
                    <ShieldCheck className="w-5 h-5 text-[#559620] shrink-0" />
                    <div>
                      {totals.amountNeededForFreeDelivery > 0 ? (
                        <span>
                          Add medicines worth{" "}
                          <strong className="text-[#559620]">
                            ₹{totals.amountNeededForFreeDelivery}
                          </strong>{" "}
                          more to unlock <strong>FREE Delivery</strong>
                        </span>
                      ) : (
                        <span className="text-[#447719] font-bold">
                          ✓ You have unlocked FREE Express Delivery on this order!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary, Coupon & Checkout */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Order Summary Card */}
                <div className="rounded-3xl border border-[#E3EDE1] bg-white p-5 sm:p-6 shadow-xs space-y-4">
                  <h2 className="font-serif text-lg sm:text-xl text-[#14304A] border-b border-[#EBF3E8] pb-3">
                    Order Summary
                  </h2>

                  <div className="space-y-2.5 text-xs sm:text-[13px] text-[#556958]">
                    <div className="flex items-center justify-between">
                      <span>Subtotal ({totals.itemCount} selected)</span>
                      <span className="font-bold text-[#14304A]">₹{totals.subtotal}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#559620]">
                      <span>Retail Discount Savings</span>
                      <span className="font-bold">- ₹{totals.discount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        Delivery Charges
                        <Info className="w-3.5 h-3.5 text-[#8CA08E]" />
                      </span>
                      <span className="font-bold text-[#14304A]">
                        {totals.deliveryCost === 0 ? "FREE" : `₹${totals.deliveryCost}`}
                      </span>
                    </div>

                    {totals.couponDiscount > 0 && (
                      <div className="flex items-center justify-between text-[#559620] bg-[#EDF7E9] px-2.5 py-1.5 rounded-xl border border-[#D5E6D0]">
                        <span className="font-bold">
                          Coupon ({appliedCoupon?.code})
                        </span>
                        <span className="font-bold">- ₹{totals.couponDiscount}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EBF3E8] flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#14304A] block">
                        Total Amount
                      </span>
                      <span className="text-[10px] text-[#8CA08E]">
                        Inclusive of GST &amp; all taxes
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-[#14304A]">
                      ₹{totals.totalAmount}
                    </span>
                  </div>

                  {/* Apply Coupon Code Bar */}
                  <div className="pt-2">
                    {appliedCoupon ? (
                      <div className="p-3 rounded-xl bg-[#EDF7E9] border border-[#D2E7CB] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#559620]" />
                          <div>
                            <span className="text-xs font-bold text-[#14304A] block">
                              Code {appliedCoupon.code} Applied
                            </span>
                            <span className="text-[10px] text-[#559620]">
                              {appliedCoupon.description}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : !showCouponInput ? (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-[#D5E6D3] bg-[#FAFCFA] hover:bg-[#F3F8EE] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#559620]" />
                          <span>Apply Coupon Code</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8CA08E]" />
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              if (couponError) setCouponError("");
                            }}
                            placeholder="e.g. GENEKON20"
                            className="w-full px-3 py-2 rounded-xl border border-[#CADDC7] text-xs font-bold uppercase tracking-wider outline-none focus:border-[#559620]"
                          />
                          <button
                            onClick={() => handleApplyCoupon()}
                            className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467e19] text-white text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>

                        {couponError && (
                          <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccess && (
                          <p className="text-[11px] text-[#559620] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{couponSuccess}</span>
                          </p>
                        )}

                        {/* Available coupons suggestion chips */}
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {AVAILABLE_COUPONS.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => handleApplyCoupon(c.code)}
                              className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-[#F2F7F1] hover:bg-[#E5F2E3] text-[#447719] border border-[#D0E2CE] cursor-pointer"
                            >
                              + {c.code} ({c.discountValue}% OFF)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Proceed to Checkout CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (totals.itemCount === 0) {
                          toast.warning("Please select at least one item to proceed to checkout.");
                          return;
                        }
                        requireAuth(
                          () => router.push("/checkout"),
                          {
                            type: "CHECKOUT",
                            title: "Proceed to Checkout",
                            redirectUrl: "/checkout",
                          },
                          "Login required to continue to checkout"
                        );
                      }}
                      className={`w-full flex items-center justify-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all cursor-pointer ${
                        totals.itemCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01]"
                      }`}
                    >
                      <span>Proceed to Checkout &rarr;</span>
                    </button>
                  </div>

                  {/* 100% Secure Payments Note */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6F8271] pt-1">
                    <ShieldCheck className="w-4 h-4 text-[#559620]" />
                    <span>100% Genuine Medicines &bull; Secure Encrypted Checkout</span>
                  </div>
                </div>

                {/* Need Help WhatsApp Box */}
                <div className="rounded-3xl border border-[#D8EBD2] bg-[#F0F8EC] p-5 text-center space-y-2">
                  <h3 className="font-bold text-sm text-[#14304A]">Need Help Ordering?</h3>
                  <p className="text-xs text-[#526657]">
                    Connect with our Nagpur fulfillment desk on WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/919370102691"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#559620] border border-[#CADFC5] text-xs font-bold px-4 py-2.5 rounded-full transition-colors w-full shadow-2xs mt-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Pharmacist &rarr;</span>
                  </a>
                </div>

              </div>

            </div>
          )}

          {/* Recommended Section */}
          <div className="mt-12 pt-8 border-t border-[#E3EDE1]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#14304A]">
                  Recommended For You
                </h2>
                <p className="text-xs text-[#556958] mt-0.5">
                  Frequently ordered healthcare essentials
                </p>
              </div>

              <Link
                href="/medicines"
                className="text-xs font-bold text-[#1853A8] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RECOMMENDED_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-[#E3EDE1] bg-white p-4 flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EDF7E9] text-[#559620]">
                        {prod.discount}% OFF
                      </span>
                      <span className="text-xs text-[#697C6B]">{prod.brand}</span>
                    </div>

                    <div className="relative w-full aspect-square mb-2 bg-[#FAFCFB] rounded-xl overflow-hidden p-2">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        sizes="160px"
                        className="object-contain"
                      />
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[#14304A] line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-[#6E8070] mt-0.5">{prod.variant}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#F0F5EE] flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-[#14304A]">
                        ₹{prod.price}
                      </span>
                      <span className="text-xs text-[#8E9F90] line-through ml-1.5">
                        ₹{prod.originalPrice}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        addToCart({
                          id: prod.id,
                          name: prod.name,
                          brand: prod.brand,
                          price: prod.price,
                          originalPrice: prod.originalPrice,
                          image: prod.image,
                          dosageForm: prod.variant,
                          stockQuantity: prod.stockQuantity,
                          inStock: true,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
