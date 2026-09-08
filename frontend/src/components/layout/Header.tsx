"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  X,
  History,
  TrendingUp,
  Clock,
  ArrowRight,
  LogOut,
  ShoppingBag
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { useAuthStore } from "@/stores/authStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProductStore, productStore } from "@/stores/productStore";
import { Product } from "@/types/product";

export const Header: React.FC = () => {
  const router = useRouter();
  const { totals } = useCart();
  const { wishlistCount } = useWishlist();
  const toast = useToast();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { requireAuth } = useAuthGuard();
  const cartCount = totals.itemCount;

  const { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } = useProductStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Nagpur");
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    toast.info("Logged out successfully. Your cart has been preserved.");
    router.push("/");
  };

  // Suggestions derived dynamically from product store
  const suggestions = searchQuery.trim() ? productStore.getSuggestions(searchQuery) : [];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const term = (customTerm !== undefined ? customTerm : searchQuery).trim();
    if (term) {
      addRecentSearch(term);
      setIsFocused(false);
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(term)}`);
    } else {
      router.push(`/search`);
    }
  };

  const selectProductSuggestion = (prod: Product) => {
    addRecentSearch(prod.name);
    setIsFocused(false);
    setMobileSearchOpen(false);
    router.push(`/product/${prod.id}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E7ECEF] shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="inline-flex items-center group">
              <div className="relative h-11 sm:h-12 w-[140px] sm:w-[160px]">
                <Image
                  src="/images/genekon-brand-logo.png"
                  alt="GENEKON Pharmaceuticals"
                  fill
                  priority
                  sizes="(max-width: 640px) 140px, 160px"
                  className="object-contain object-left group-hover:opacity-95 transition-opacity"
                />
              </div>
            </Link>
          </div>

          {/* Center Search Bar with Suggestions Dropdown */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl mx-auto relative">
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative w-full flex items-center rounded-full border border-[#D5DFE6] bg-white hover:border-[#1E56A0] focus-within:border-[#1E56A0] focus-within:ring-2 focus-within:ring-[#1E56A0]/10 transition-all overflow-hidden pl-4 pr-1.5 py-1 shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#8C9BA5] shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search medicines, healthcare products, wellness & more..."
                className="w-full text-xs sm:text-sm text-[#14304A] placeholder:text-[#8C9BA5] bg-transparent outline-none py-1.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-[#8C9BA5] hover:text-[#14304A] mr-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="h-9 w-11 rounded-full bg-[#1A52A3] hover:bg-[#144285] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Desktop Suggestions & Recent Searches Dropdown */}
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#DDE7DC] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* When User is Typing: Matching Products */}
                {searchQuery.trim() ? (
                  <div>
                    <div className="px-4 py-2.5 bg-[#F8FAF8] border-b border-[#E3EDE1] flex items-center justify-between text-xs font-bold text-[#6B806E]">
                      <span>PRODUCTS MATCHING &quot;{searchQuery}&quot;</span>
                      <span>{suggestions.length} found</span>
                    </div>

                    {suggestions.length > 0 ? (
                      <div className="divide-y divide-[#F0F5F0] max-h-80 overflow-y-auto">
                        {suggestions.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => selectProductSuggestion(product)}
                            className="p-3 hover:bg-[#F4F8F3] transition-colors cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg bg-[#FAFCFB] border border-[#E2EAE0] p-0.5 shrink-0 overflow-hidden">
                                <Image
                                  src={product.images?.[0] || product.image}
                                  alt={product.name}
                                  fill
                                  sizes="40px"
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#14304A] line-clamp-1">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-[#697D6B]">
                                  <span>{product.brand}</span>
                                  <span>&bull;</span>
                                  <span className="text-[#559620] font-medium">{product.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-[#14304A]">
                                ₹{product.price}
                              </span>
                              {product.mrp && product.mrp > product.price && (
                                <span className="block text-[10px] text-[#768C78] line-through">
                                  ₹{product.mrp}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        <div
                          onClick={() => handleSearchSubmit()}
                          className="p-3 bg-[#FAFCFA] hover:bg-[#EDF7E9] text-center text-xs font-bold text-[#1853A8] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>See all results for &quot;{searchQuery}&quot;</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-[#6B806E]">
                        <p>No products directly match &quot;{searchQuery}&quot;</p>
                        <p className="mt-1 text-[11px] text-[#91A394]">
                          Press Enter to search all brands and active formulas.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* When Search is Blank: Recent Searches & Popular Searches */
                  <div className="p-4 space-y-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EDF3EC]">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#14304A]">
                            <Clock className="w-3.5 h-3.5 text-[#559620]" />
                            <span>Recent Searches</span>
                          </div>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-[11px] text-[#559620] hover:underline font-semibold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term) => (
                            <span
                              key={term}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F6F1] text-xs text-[#14304A] hover:bg-[#E3EFE1] transition-colors cursor-pointer group"
                            >
                              <span onClick={() => handleSearchSubmit(undefined, term)}>
                                {term}
                              </span>
                              <X
                                className="w-3 h-3 text-[#7B8F7D] hover:text-red-500 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRecentSearch(term);
                                }}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Trending Suggestions */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#14304A] pb-2 mb-2 border-b border-[#EDF3EC]">
                        <TrendingUp className="w-3.5 h-3.5 text-[#1853A8]" />
                        <span>Popular Health Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Vitamin D3", "Paracetamol", "Cetaphil", "Thermometer", "Chyawanprash", "Protein"].map(
                          (item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleSearchSubmit(undefined, item)}
                              className="px-3 py-1 rounded-full border border-[#DCE8D8] hover:border-[#559620] hover:bg-[#EDF7E9] text-xs text-[#2A4430] font-medium transition-all cursor-pointer"
                            >
                              {item}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: Location, Account, Wishlist, Cart */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0 text-sm font-semibold text-[#14304A]">
            
            {/* Location Selector (Nagpur) */}
            <button
              className="hidden lg:flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F4F7F9] transition-colors cursor-pointer text-[#14304A]"
              title="Select Delivery Location"
            >
              <MapPin className="w-4 h-4 text-[#14304A] shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{location}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#68746F]" />
            </button>

            {/* Account / Login */}
            {isLoggedIn && user ? (
              <div ref={userMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 hover:text-[#1A52A3] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EDF7E9] text-[#559620] border border-[#D5E6D0] flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#14304A]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#68746F]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#DDE7DC] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[#EDF3EC]">
                      <p className="text-xs font-bold text-[#14304A] line-clamp-1">{user.name}</p>
                      <p className="text-[10px] text-[#697C6B]">+91 {user.mobile}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#14304A] hover:bg-[#F2F7F1] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#559620]" />
                      <span>My Account</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#14304A] hover:bg-[#F2F7F1] transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#1853A8]" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#14304A] hover:bg-[#F2F7F1] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#559620]" />
                      <span>Saved Addresses</span>
                    </Link>

                    <div className="border-t border-[#EDF3EC] my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 hover:text-[#1A52A3] transition-colors"
              >
                <User className="w-4 h-4 text-[#14304A]" />
                <span className="text-xs sm:text-sm">Sign In</span>
              </Link>
            )}

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => {
                requireAuth(
                  () => router.push("/wishlist"),
                  {
                    type: "WISHLIST",
                    title: "Wishlist",
                    redirectUrl: "/wishlist",
                  },
                  "Login required to access your saved healthcare wishlist"
                );
              }}
              className="relative hidden sm:flex items-center gap-1.5 hover:text-[#69A82F] transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#14304A]" />
              <span className="text-xs sm:text-sm">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E02D3C] px-1 text-[10px] font-extrabold text-white leading-none shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart with Green Badge */}
            <Link
              href="/cart"
              className="relative flex items-center p-1.5 hover:text-[#1A52A3] transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#14304A]" />
              <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#69A82F] px-1 text-[10px] font-extrabold text-white leading-none shadow-xs">
                {cartCount}
              </span>
            </Link>

            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-1.5 text-[#14304A] hover:bg-[#F4F7F9] rounded-lg cursor-pointer"
              aria-label="Toggle Search Bar"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Search Dropdown with Recent Searches */}
        {mobileSearchOpen && (
          <div className="mt-2.5 pt-2 border-t border-[#E7ECEF] md:hidden space-y-3">
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative w-full flex items-center rounded-full border border-[#D5DFE6] bg-white pl-4 pr-1.5 py-1"
            >
              <Search className="w-4 h-4 text-[#8C9BA5] shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, health products..."
                className="w-full text-xs text-[#14304A] placeholder:text-[#8C9BA5] bg-transparent outline-none py-1"
              />
              <button
                type="submit"
                className="h-8 w-9 rounded-full bg-[#1A52A3] text-white flex items-center justify-center shrink-0"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile suggestions or recent searches */}
            {searchQuery.trim() && suggestions.length > 0 ? (
              <div className="rounded-xl border border-[#E3EDE1] bg-white divide-y divide-[#F0F5F0] max-h-56 overflow-y-auto">
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectProductSuggestion(p)}
                    className="p-2.5 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="font-bold text-[#14304A]">{p.name}</span>
                    <span className="font-mono text-[#559620]">₹{p.price}</span>
                  </div>
                ))}
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 py-1">
                {recentSearches.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearchSubmit(undefined, term)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#F2F6F1] text-[#14304A]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
};
