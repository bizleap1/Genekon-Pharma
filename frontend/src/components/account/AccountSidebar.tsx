"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Package,
  FileText,
  Heart,
  MapPin,
  Bell,
  LogOut,
  ShieldCheck,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useWishlist } from "@/context/WishlistContext";
import { orderService } from "@/services/orderService";
import { useToast } from "@/context/ToastContext";

export const AccountSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, logout, isAdmin } = useAuthStore();
  const { wishlistCount } = useWishlist();
  const [orderCount, setOrderCount] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = orderService.getStoredOrders();
      if (stored && stored.length > 0) {
        setOrderCount(stored.length);
      } else {
        setOrderCount(undefined);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully. Your cart has been preserved.");
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/account", icon: LayoutDashboard },
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "My Orders", href: "/account/orders", icon: Package, badge: orderCount ? String(orderCount) : undefined },
    { label: "Prescriptions", href: "/account/prescriptions", icon: FileText },
    { label: "Wishlist", href: "/wishlist", icon: Heart, badge: wishlistCount > 0 ? String(wishlistCount) : undefined },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const clean = name.replace(/^Dr\.?\s*/i, "").trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      
      {/* Customer Avatar & Quick Status */}
      <div className="rounded-3xl border border-[#DCE8D8] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] font-serif text-lg font-bold flex items-center justify-center shrink-0 border border-[#D5E4D2]">
            {getInitials(user?.name)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-serif text-base font-bold text-[#14304A] truncate" title={user?.name || "Customer"}>
              {user?.name || "Customer"}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#637766]">
              <span>{user?.mobile ? `+91 ${user.mobile}` : "Customer Account"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#559620]" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#EAF2E8] flex items-center justify-between text-[11px] text-[#586E5B]">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#559620]" />
            {user?.role === "admin" ? "Lead Super Admin" : "Verified Customer"}
          </span>
          <span className="font-bold text-[#14304A]">{user?.city || "India"}</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="rounded-3xl border border-[#DCE8D8] bg-white p-3 shadow-2xs">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#559620] text-white shadow-2xs"
                    : "text-[#14304A] hover:bg-[#F2F7F1] hover:text-[#559620]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#559620]"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white text-[#559620]"
                        : "bg-[#EDF7E9] text-[#447719]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Dashboard Quick Access - ONLY for Admin */}
          {isAdmin && (
            <div className="pt-2 border-t border-[#EAF2E8] mt-2">
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#14304A] text-white hover:bg-[#1E4366] transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#7BD434] group-hover:scale-110 transition-transform" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#559620] text-white">
                  Admin
                </span>
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* WhatsApp Pharmacist Help Widget */}
      <div className="rounded-3xl border border-[#CDE5C8] bg-linear-to-br from-[#F2F8F0] to-white p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#14304A]">
              Need Quick Refill Help?
            </h4>
            <p className="text-[11px] text-[#617663] mt-0.5 leading-relaxed">
              Message your prescription or order ID to our pharmacist.
            </p>
            <a
              href="https://wa.me/919370102691?text=Hello%20Genekon%20Pharmacy,%20I%20need%20assistance%20with%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#25D366] hover:underline mt-2.5"
            >
              <span>Chat on WhatsApp</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

    </aside>
  );
};
