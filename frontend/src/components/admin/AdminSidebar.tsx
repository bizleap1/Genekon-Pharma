"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  FileText,
  Users,
  Building2,
  Tag,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { label: "Overview Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Product Catalog", href: "/admin/products", icon: Package, badge: "8" },
    { label: "Inventory & Stock", href: "/admin/inventory", icon: Layers, badge: "Low" },
    { label: "Orders Management", href: "/admin/orders", icon: ShoppingBag, badge: "5" },
    { label: "Prescription Queue", href: "/admin/prescriptions", icon: FileText, badge: "14" },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Wholesale B2B", href: "/admin/wholesale", icon: Building2, badge: "2" },
    { label: "Coupons & Offers", href: "/admin/offers", icon: Tag },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2EAE0] flex flex-col justify-between shrink-0 min-h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E2EAE0]">
          <Link href="/admin/dashboard" className="block">
            <div className="relative h-10 w-36 mb-1">
              <Image
                src="/images/genekon-brand-logo.png"
                alt="Genekon Admin"
                fill
                sizes="144px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
              <ShieldCheck className="w-3 h-3" />
              Pharmacist Console
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/dashboard" && pathname === "/admin") ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#559620] text-white shadow-2xs"
                    : "text-[#14304A] hover:bg-[#F2F7F1] hover:text-[#559620]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#559620]"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white text-[#559620]"
                        : item.badge === "Low"
                        ? "bg-[#FFF4E5] text-[#D97706]"
                        : "bg-[#EDF7E9] text-[#447719]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switch to Storefront */}
      <div className="p-4 border-t border-[#E2EAE0]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-2.5 rounded-xl border border-[#D5E2D3] bg-[#FAFCFA] hover:bg-[#F0F6EE] text-xs font-bold text-[#14304A] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#559620] animate-pulse" />
            <span>View Live Store</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#559620] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
};
