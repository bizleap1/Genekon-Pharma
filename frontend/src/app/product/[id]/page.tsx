"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  MapPin,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Sparkles,
  Droplets,
  CheckCircle2,
  Tag,
  ChevronRight,
  Plus,
  Minus,
  AlertTriangle,
  Building2
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ALL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useProductQuery } from "@/hooks/api/useProductsQuery";

const TABS = [
  { id: "details", label: "Product Details" },
  { id: "benefits", label: "Key Benefits & Salts" },
  { id: "usage", label: "How to Use" },
  { id: "safety", label: "Safety & Indications" },
  { id: "reviews", label: "Reviews" },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.id === "string" ? params.id : "prod-1";

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isWholesale, user } = useAuth();
  const toast = useToast();

  // Find product or fallback to first product
  const { data: liveProduct } = useProductQuery(productId);
  const product = useMemo(() => {
    if (liveProduct) return liveProduct;
    return ALL_PRODUCTS.find((p) => p.id === productId) || ALL_PRODUCTS[0];
  }, [liveProduct, productId]);

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || product.image
  );
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || {
      id: "var-1",
      name: product.dosageForm || product.packSize || "Standard",
      price: product.price,
      mrp: product.mrp,
      stock: product.stockQuantity,
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [pincode, setPincode] = useState("440013");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const currentStock = selectedVariant.stock !== undefined ? selectedVariant.stock : product.stockQuantity;
  const isOutOfStock = currentStock === 0 || product.stockStatus === "Out of Stock" || product.inStock === false;
  const isLowStock = !isOutOfStock && (currentStock <= 10 || product.stockStatus === "Low Stock");

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleQuantityIncrease = () => {
    if (quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.warning(`Only ${currentStock} units available in stock.`);
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const { requireAuth } = useAuthGuard();

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This medicine is currently out of stock.");
      return;
    }
    requireAuth(
      () => {
        const res = addToCart(
          {
            ...product,
            price: selectedVariant.price,
            stockQuantity: currentStock,
          },
          quantity,
          selectedVariant.name
        );
        if (res.success) {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }
      },
      {
        type: "ADD_TO_CART",
        title: `Add ${product.name} to Cart`,
        payload: {
          product: {
            ...product,
            price: selectedVariant.price,
            stockQuantity: currentStock,
          },
          quantity,
          variant: selectedVariant.name,
        },
        redirectUrl: `/product/${product.id}`,
      }
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This medicine is currently out of stock.");
      return;
    }
    requireAuth(
      () => {
        addToCart(
          {
            ...product,
            price: selectedVariant.price,
            stockQuantity: currentStock,
          },
          quantity,
          selectedVariant.name
        );
        router.push("/checkout");
      },
      {
        type: "BUY_NOW",
        title: `Buy ${product.name} Now`,
        payload: {
          product: {
            ...product,
            price: selectedVariant.price,
            stockQuantity: currentStock,
          },
          quantity,
          variant: selectedVariant.name,
        },
        redirectUrl: "/checkout",
      }
    );
  };

  const handleToggleWishlist = () => {
    requireAuth(
      () => {
        toggleWishlist(product);
      },
      {
        type: "WISHLIST",
        title: `Save ${product.name} to Wishlist`,
        payload: { product },
        redirectUrl: `/product/${product.id}`,
      }
    );
  };

  const handleCheckPincode = () => {
    const cleanPin = pincode.trim().replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setPincodeError("Please enter a valid 6-digit Indian PIN code");
      setPincodeChecked(false);
      return;
    }
    setPincodeError("");
    setPincodeChecked(true);
  };

  const relatedProducts = ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-5 sm:py-7">
        <Container>
          
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[#6F8271] mb-5">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <Link href={`/category/${product.category.toLowerCase().replace(/ & | /g, "-")}`} className="hover:text-[#14304A] transition-colors">
              {product.category}
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">{product.name}</span>
          </nav>

          {/* Main Product Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Image Gallery & Highlights (Span 5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-3xl border border-[#E0EDE0] bg-[#FAFCFB] p-6 flex items-center justify-center min-h-[380px] overflow-hidden">
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                  {product.discount > 0 && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#559620] text-white">
                      {product.discount}% OFF
                    </span>
                  )}
                  {product.prescriptionRequired && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3FC] text-[#1853A8] border border-[#CADCF2]">
                      Rx Required
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-[#DDE7DC] flex items-center justify-center text-[#7B8F7E] hover:text-red-500 shadow-2xs transition-colors z-10 cursor-pointer"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </button>

                {/* Main Image */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="300px"
                    className={`object-contain transition-transform duration-300 ${
                      isOutOfStock ? "opacity-60 grayscale-[30%]" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 rounded-xl border p-1 overflow-hidden transition-all ${
                        selectedImage === img
                          ? "border-2 border-[#559620] shadow-xs"
                          : "border-[#DCE7DA] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="Thumbnail" fill sizes="56px" className="object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* 4 Feature Pills Below Image */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl border border-[#E3EDE1] bg-[#F7FAF6] text-[#3D5240] font-semibold flex flex-col items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#559620]" />
                  <span>100% Authentic</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E3EDE1] bg-[#F7FAF6] text-[#3D5240] font-semibold flex flex-col items-center gap-1">
                  <Droplets className="w-4 h-4 text-[#1853A8]" />
                  <span>Lab Tested</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E3EDE1] bg-[#F7FAF6] text-[#3D5240] font-semibold flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#559620]" />
                  <span>GMP Certified</span>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E3EDE1] bg-[#F7FAF6] text-[#3D5240] font-semibold flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#1853A8]" />
                  <span>Doctor Choice</span>
                </div>
              </div>
            </div>

            {/* CENTER: Product Title, Pricing, Stock, Actions (Span 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <span className="text-xs font-bold text-[#559620] uppercase tracking-wider block">
                  {product.brand}
                </span>
                <div className="flex items-center gap-2.5 flex-wrap mt-1">
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                    {product.name}
                  </h1>
                  {product.prescriptionRequired && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EBF3FC] text-[#1853A8] border border-[#CADCF2] text-xs font-bold shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1853A8]" />
                      <span>Rx Prescription Required</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#556958] mt-1">
                  {product.composition || product.dosageForm || product.category}
                </p>

                {/* Rating */}
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 font-bold text-[#EAA21D] bg-[#FEF9EE] border border-[#F6E7C4] px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-[#EAA21D]" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-[#697C6B]">({product.reviewCount || 450} reviews)</span>
                  <span className="text-[#D0DFD2]">|</span>
                  <span className="font-semibold text-[#1853A8]">In {product.category}</span>
                </div>
              </div>

              {/* Stock Status Banner */}
              <div>
                {isOutOfStock ? (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Currently Out of Stock. Stock replenishment expected soon.</span>
                  </div>
                ) : isLowStock ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Hurry! Only {currentStock} units left in dispensary stock.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#559620]" />
                    <span>In Stock ({currentStock} available units ready for dispatch)</span>
                  </div>
                )}
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5EFE3] space-y-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#14304A]">
                    ₹{selectedVariant.price}
                  </span>
                  {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
                    <span className="text-sm text-[#8A9C8C] line-through">
                      ₹{selectedVariant.mrp}
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-xs font-extrabold text-[#559620] bg-[#EDF7E9] px-2 py-0.5 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#7A8D7C] block">
                  Inclusive of all taxes • MRP ₹{selectedVariant.mrp || product.mrp}
                </span>

                {/* Prescription requirement note near price */}
                {product.prescriptionRequired && (
                  <div className="pt-2 border-t border-[#E5EFE3] text-xs text-[#1853A8] flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1853A8]" />
                    <span>Prescription required before purchase.</span>
                  </div>
                )}

                {/* Offers callout */}
                <div className="pt-2 border-t border-[#E5EFE3] flex items-center justify-between text-xs text-[#559620] font-semibold cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Save 20% extra: Use coupon GENEKON20</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>

                {/* Exclusive Wholesale Volume Pricing (Visible only for wholesale partners) */}
                {Boolean(isWholesale || user?.role === "wholesale") && (
                  <div className="mt-3 p-3 rounded-xl bg-[#EBF3FC] border border-[#CADCF2] text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-[#1853A8]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#1853A8]" />
                        Wholesale B2B Partner Rate
                      </span>
                      <span className="text-sm font-black text-[#14304A]">
                        ₹{Math.round(selectedVariant.price * 0.75)} / unit
                      </span>
                    </div>
                    <div className="text-[11px] text-[#4A6B82] flex justify-between font-medium">
                      <span>Min. Order: 10 units (Bulk 25% Margin)</span>
                      <span className="font-bold text-[#559620]">Case Qty: 50 units</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#14304A] block mb-2">
                    Select Pack / Variant: <strong className="text-[#559620]">{selectedVariant.name}</strong>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedVariant.id === v.id
                            ? "border-2 border-[#559620] bg-[#F0F8EC] text-[#14304A] font-bold"
                            : "border-[#DCE7DA] bg-white text-[#556958] hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xs block">{v.name}</span>
                        <span className="text-[11px] font-bold text-[#559620]">₹{v.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rx Prescription Required Notice near Add To Cart */}
              {product.prescriptionRequired && (
                <div className="p-3 rounded-xl bg-[#F0F6FF] border border-[#CADCF2] text-xs text-[#1853A8] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1853A8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Rx Prescription Required</span>
                    <span className="text-[11px] text-[#3D6899] block mt-0.5">
                      Prescription required before purchase. A valid doctor&apos;s prescription must be uploaded or verified before dispatch.
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity & Buy Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#14304A]">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-[#D5E6D3] bg-[#FAFCFB]">
                    <button
                      onClick={handleQuantityDecrease}
                      disabled={isOutOfStock || quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-[#556958] hover:text-[#559620] disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                    <button
                      onClick={handleQuantityIncrease}
                      disabled={isOutOfStock || quantity >= currentStock}
                      className="w-8 h-8 flex items-center justify-center text-[#556958] hover:text-[#559620] disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {isLowStock && (
                    <span className="text-[11px] text-[#D97706] font-semibold">
                      Max {currentStock} available
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-2xs ${
                      isOutOfStock
                        ? "bg-[#DDE5E0] text-[#8C9C8F] cursor-not-allowed"
                        : "bg-[#559620] hover:bg-[#467e19] text-white cursor-pointer"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-2xs ${
                      isOutOfStock
                        ? "bg-[#DDE5E0] text-[#8C9C8F] cursor-not-allowed"
                        : "bg-[#1853A8] hover:bg-[#123e7f] text-white cursor-pointer"
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Pincode Delivery Check */}
              <div className="pt-3 border-t border-[#E5EFE3]">
                <label className="text-xs font-bold text-[#14304A] flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#559620]" />
                  <span>Check delivery to your pincode</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setPincodeError("");
                    }}
                    placeholder="Enter 6-digit PIN"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CADDC7] text-xs font-semibold outline-none focus:border-[#559620]"
                  />
                  <button
                    onClick={handleCheckPincode}
                    className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467e19] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Check
                  </button>
                </div>
                {pincodeError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {pincodeError}
                  </p>
                )}
                {pincodeChecked && !pincodeError && (
                  <p className="text-[11px] text-[#559620] font-semibold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Free express delivery to PIN {pincode} by tomorrow 6 PM.</span>
                  </p>
                )}
              </div>

            </div>

            {/* RIGHT: Trust Badges & Mini Banner (Span 3) */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Trust Badges */}
              <div className="rounded-3xl border border-[#E3EDE1] bg-white p-5 space-y-3.5 text-xs text-[#14304A]">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-bold block">100% Genuine Products</span>
                    <span className="text-[11px] text-[#697C6B]">Sourced direct from authorized manufacturers</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#EDF5EC]">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-bold block">Secure Payments</span>
                    <span className="text-[11px] text-[#697C6B]">UPI, Cards, Netbanking &amp; COD</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#EDF5EC]">
                  <div className="w-7 h-7 rounded-lg bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-bold block">Temperature Controlled</span>
                    <span className="text-[11px] text-[#697C6B]">Safe pharmaceutical delivery</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#EDF5EC]">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF2E8] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-bold block">Hassle-Free Returns</span>
                    <span className="text-[11px] text-[#697C6B]">7 days replacement on damaged items</span>
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-gradient-to-br from-[#EBF5E7] via-[#E4F1DF] to-[#EFF7EC] p-5">
                <h3 className="font-serif text-lg text-[#14304A]">
                  Genekon Pharmacy <br />
                  <span className="text-[#1853A8]">Care Guarantee.</span>
                </h3>
                <p className="text-xs text-[#526657] mt-1">
                  Every batch verified by licensed pharmacists before dispatch.
                </p>
              </div>

            </div>

          </div>

          {/* Important Medicine Disclaimer Callout */}
          <div className="mt-8 rounded-2xl bg-[#FFF9F2] border border-[#FDE5CD] p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#FDE5CD] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#14304A]">
                Healthcare &amp; Medicine Disclaimer
              </h4>
              <p className="text-xs text-[#6E553B] mt-0.5 leading-relaxed">
                Medicine information is for reference only. Consult healthcare professional before taking, substituting, or changing any medication dosage.
              </p>
            </div>
          </div>

          {/* Detailed Product Tabs & Specifications */}
          <div className="mt-8 rounded-3xl border border-[#E3EDE1] bg-white p-6 sm:p-8">
            {/* Tabs Row */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-[#EBF3E8] pb-3 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs sm:text-sm font-bold pb-2 shrink-0 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "text-[#559620] border-b-2 border-[#559620]"
                      : "text-[#697C6B] hover:text-[#14304A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-7 space-y-4">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-[#506352] leading-relaxed">
                      {product.description}
                    </p>
                    <div className="space-y-2.5 pt-2 text-xs text-[#3D5240]">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0 mt-0.5" />
                        <span><strong>Active Composition:</strong> {product.composition}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0 mt-0.5" />
                        <span><strong>Manufacturer:</strong> {product.manufacturer || product.brand}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0 mt-0.5" />
                        <span><strong>Storage:</strong> {product.storageInstructions || "Store below 25°C in a dry place."}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0 mt-0.5" />
                        <span>
                          <strong>Prescription Status:</strong>{" "}
                          {product.prescriptionRequired
                            ? "Schedule H Prescription Required (Valid doctor Rx mandatory)"
                            : "Over The Counter (OTC — No prescription required)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "benefits" && (
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-[#14304A]">
                      Key Therapeutic Benefits &amp; Action
                    </h4>
                    <p className="text-xs sm:text-sm text-[#506352] leading-relaxed">
                      Formulated with pharmaceutical-grade standards. {product.description}
                    </p>
                    <ul className="space-y-2 pt-2 text-xs text-[#3D5240]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0" />
                        <span>Fast-absorbing and clinically validated composition</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0" />
                        <span>High bioavailability with certified excipients</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0" />
                        <span>Packaged in protective barrier foil to preserve potency</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-[#14304A]">
                      Directions for Use &amp; Dosage Guidelines
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#F7FAF6] border border-[#E3EDE1] text-xs sm:text-sm text-[#435746] leading-relaxed">
                      {product.usage || "Take as directed by your treating physician or follow label instructions carefully."}
                    </div>
                    <p className="text-xs text-[#697C6B]">
                      Always swallow with sufficient quantity of water unless instructed otherwise. Do not chew or crush delayed-release or enteric-coated preparations.
                    </p>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-[#14304A]">
                      Safety Advice &amp; Warnings
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#FADCDA] text-xs text-[#8A3232] leading-relaxed space-y-2">
                      <p>
                        <strong>Precautions:</strong> {product.precautions || "Keep out of reach of children. Discontinue and consult your physician in case of adverse reaction."}
                      </p>
                      <p>
                        <strong>Pregnancy &amp; Lactation:</strong> Consult your healthcare professional prior to taking if pregnant, planning to become pregnant, or breastfeeding.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F7FAF6] border border-[#E3EDE1] text-xs text-[#435746]">
                      <strong>Storage:</strong> {product.storageInstructions || "Store below 25°C in a cool and dry place."}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#D97706]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#D97706]" />
                        ))}
                      </div>
                      <span className="font-bold text-sm text-[#14304A]">{product.rating} out of 5</span>
                      <span className="text-xs text-[#697C6B]">({product.reviewCount || 450} verified patient reviews)</span>
                    </div>
                    <p className="text-xs text-[#506352]">
                      98% of verified patients reported positive therapeutic outcomes with genuine Genekon pharmacy dispatch.
                    </p>
                  </div>
                )}
              </div>

              {/* Specifications Table */}
              <div className="md:col-span-5 rounded-2xl bg-[#FAFCFB] border border-[#E7ECEF] p-4 text-xs">
                <div className="divide-y divide-[#EBF3E8] space-y-2">
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">Brand</span>
                    <span className="font-bold text-[#14304A]">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">Manufacturer</span>
                    <span className="font-bold text-[#14304A] text-right max-w-[200px] truncate">{product.manufacturer || product.brand}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">Category</span>
                    <span className="font-bold text-[#14304A]">{product.category}</span>
                  </div>
                  {product.subCategory && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697C6B]">Subcategory</span>
                      <span className="font-bold text-[#14304A]">{product.subCategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">SKU / Batch</span>
                    <span className="font-mono font-bold text-[#14304A]">{product.sku || "GNK-PH-01"} / {product.batchNumber || "BTH-2026"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">Expiry Date</span>
                    <span className="font-bold text-[#14304A]">{product.expiryDate || "10/2028"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">GST Rate</span>
                    <span className="font-bold text-[#14304A]">{product.gst || 12}% Included</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">Stock Status</span>
                    <span className={`font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-[#D97706]" : "text-[#559620]"}`}>
                      {product.stockStatus} ({currentStock} available)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#697C6B]">Country of Origin</span>
                    <span className="font-bold text-[#14304A]">India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Frequently Bought Together / Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="font-serif text-xl sm:text-2xl text-[#14304A] mb-1">
                Frequently Bought Together
              </h3>
              <p className="text-xs text-[#556958] mb-5">
                Customers who bought this item also purchased
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="rounded-2xl border border-[#E3EDE1] bg-white p-4 flex flex-col justify-between hover:shadow-xs transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EDF7E9] text-[#559620]">
                          {prod.discount}% OFF
                        </span>
                        <button
                          onClick={() => toggleWishlist(prod)}
                          aria-label="Wishlist"
                          className="cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(prod.id) ? "fill-red-500 text-red-500" : "text-[#8CA08E]"}`} />
                        </button>
                      </div>

                      <Link href={`/product/${prod.id}`} className="block relative w-full aspect-square mb-2">
                        <Image
                          src={prod.images?.[0] || prod.image}
                          alt={prod.name}
                          fill
                          sizes="160px"
                          className="object-contain"
                        />
                      </Link>

                      <Link href={`/product/${prod.id}`}>
                        <h4 className="text-xs font-bold text-[#14304A] line-clamp-1 hover:text-[#559620]">{prod.name}</h4>
                      </Link>
                      <p className="text-[11px] text-[#788C7A] mt-0.5">{prod.dosageForm || prod.packSize}</p>

                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-sm font-bold text-[#14304A]">₹{prod.price}</span>
                        <span className="text-xs text-[#8E9F90] line-through">₹{prod.mrp}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="mt-3 w-full py-1.5 rounded-lg border border-[#559620] text-[#559620] hover:bg-[#559620] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </Container>
      </main>

      <Footer />
    </div>
  );
}
