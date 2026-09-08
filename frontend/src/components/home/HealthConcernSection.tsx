import React from "react";
import Link from "next/link";
import {
  Activity,
  Heart,
  ShieldPlus,
  Bone,
  ThermometerSnowflake,
  Sparkles,
  Pill,
  Eye,
  ChevronRight
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HEALTH_CONCERNS } from "@/data/categories";

const CONCERN_ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Heart,
  ShieldPlus,
  Bone,
  ThermometerSnowflake,
  Sparkles,
  Pill,
  Eye,
};

export const HealthConcernSection: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 bg-white">
      <Container>
        <SectionHeading
          eyebrow="TARGETED WELLNESS"
          title="Shop By Health Concern"
          description="Targeted medical care, certified diagnostics, and remedies tailored to specific health conditions."
          actionText="All Health Concerns"
          actionHref="/health-concerns"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {HEALTH_CONCERNS.map((concern, idx) => {
            const IconComponent =
              CONCERN_ICON_MAP[concern.iconName] || Activity;
            const isBlue = idx % 2 === 1;

            return (
              <Link
                key={concern.id}
                href={concern.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E7ECEF] bg-[#FAFCFB] p-4 sm:p-5 transition-all duration-200 hover:bg-white hover:border-[#315FAE]/30 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                        isBlue
                          ? "bg-[#F2F6FC] text-[#315FAE]"
                          : "bg-[#F3F8EE] text-[#69A82F]"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {concern.badge ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F8EE] text-[#69A82F]">
                        {concern.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#68746F] bg-white border border-[#E7ECEF] px-2 py-0.5 rounded-full">
                        {concern.itemCount} items
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#14304A] group-hover:text-[#315FAE] transition-colors line-clamp-1">
                    {concern.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#68746F] line-clamp-2 leading-relaxed">
                    {concern.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#E7ECEF]/70 flex items-center justify-between text-xs font-semibold text-[#315FAE]">
                  <span>Explore Care</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
