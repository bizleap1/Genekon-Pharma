"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  ShoppingBag,
  PlusSquare,
  RotateCcw,
  ChevronRight
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProtectedAction } from "@/components/auth/ProtectedAction";
import { IntendedAction } from "@/stores/authStore";

interface QuickServiceItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: any;
  circleBg: string;
  circleColor: string;
  cardBg: string;
  borderColor: string;
  arrowColor: string;
  protectedAction?: IntendedAction;
}

const QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: "upload-rx",
    title: "Upload Prescription",
    subtitle: "Get medicines with ease.",
    href: "/prescription/upload",
    icon: Upload,
    circleBg: "bg-[#1853A8]",
    circleColor: "text-white",
    cardBg: "bg-[#F3F7FD]",
    borderColor: "border-[#DCE8F7]",
    arrowColor: "text-[#1853A8]",
    protectedAction: {
      type: "UPLOAD_PRESCRIPTION",
      title: "Upload Prescription",
      redirectUrl: "/prescription/upload",
    },
  },
  {
    id: "order-medicines",
    title: "Order Medicines",
    subtitle: "Search & add to cart.",
    href: "/category/medicines",
    icon: ShoppingBag,
    circleBg: "bg-[#EBF5E5]",
    circleColor: "text-[#4B8C1D]",
    cardBg: "bg-[#F6FAF3]",
    borderColor: "border-[#DFEDE0]",
    arrowColor: "text-[#4B8C1D]",
  },
  {
    id: "healthcare-essentials",
    title: "Healthcare Essentials",
    subtitle: "Everything for your health.",
    href: "/category/healthcare",
    icon: PlusSquare,
    circleBg: "bg-[#EBF2FC]",
    circleColor: "text-[#1853A8]",
    cardBg: "bg-[#F3F7FD]",
    borderColor: "border-[#DCE8F7]",
    arrowColor: "text-[#1853A8]",
  },
  {
    id: "repeat-order",
    title: "Repeat Previous Order",
    subtitle: "Quick & hassle-free.",
    href: "/account/orders",
    icon: RotateCcw,
    circleBg: "bg-[#EBF5E5]",
    circleColor: "text-[#4B8C1D]",
    cardBg: "bg-[#F6FAF3]",
    borderColor: "border-[#DFEDE0]",
    arrowColor: "text-[#4B8C1D]",
    protectedAction: {
      type: "TRACK_ORDER",
      title: "Repeat Previous Order",
      redirectUrl: "/account/orders",
    },
  },
];

export const QuickActions: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-2 bg-white">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {QUICK_SERVICES.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border ${item.borderColor} ${item.cardBg} hover:shadow-sm hover:border-[#315FAE]/40 transition-all duration-200 cursor-pointer w-full`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${item.circleBg} ${item.circleColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-[#14304A]">
                      {item.title}
                    </span>
                    <span className="text-xs text-[#627764] mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                <div className={`${item.arrowColor} transition-transform group-hover:translate-x-0.5`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );

            if (item.protectedAction) {
              return (
                <ProtectedAction
                  key={item.id}
                  action={item.protectedAction}
                  onAction={() => router.push(item.href)}
                >
                  {content}
                </ProtectedAction>
              );
            }

            return (
              <Link key={item.id} href={item.href} className="block w-full">
                {content}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
