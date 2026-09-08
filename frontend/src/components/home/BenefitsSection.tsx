import React from "react";
import {
  ShieldCheck,
  UserCheck,
  ThermometerSnowflake,
  PackageCheck
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRUSTED_BENEFITS = [
  {
    id: "genuine",
    title: "100% Genuine Sourcing",
    description:
      "All pharmaceuticals and wellness products are procured directly from licensed manufacturers and authorized distributors.",
    icon: ShieldCheck,
    color: "text-[#69A82F]",
    bg: "bg-[#F3F8EE]",
  },
  {
    id: "pharmacist",
    title: "Pharmacist Verified",
    description:
      "Every prescription order undergoes a mandatory review by qualified pharmacists to verify dosage, instructions, and safety.",
    icon: UserCheck,
    color: "text-[#315FAE]",
    bg: "bg-[#F2F6FC]",
  },
  {
    id: "storage",
    title: "Regulated Storage",
    description:
      "State-of-the-art climate-monitored facilities ensure sensitive formulations and syrups maintain full therapeutic potency.",
    icon: ThermometerSnowflake,
    color: "text-[#69A82F]",
    bg: "bg-[#F3F8EE]",
  },
  {
    id: "packaging",
    title: "Tamper-Evident Packaging",
    description:
      "Orders are packed in sealed, moisture-proof and discreet containers ensuring your privacy and product integrity.",
    icon: PackageCheck,
    color: "text-[#315FAE]",
    bg: "bg-[#F2F6FC]",
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 bg-[#FAFCFB] border-y border-[#E7ECEF]/80">
      <Container>
        <SectionHeading
          eyebrow="THE GENEKON COMMITMENT"
          title="Healthcare Built On Authenticity & Trust"
          description="Every order is handled with clinical precision, regulated pharmaceutical storage, and strict verification protocols."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {TRUSTED_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.id}
                className="rounded-2xl border border-[#E7ECEF] bg-white p-5 sm:p-6 transition-all duration-200 hover:shadow-xs hover:border-[#315FAE]/30"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-[#14304A]">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-[#68746F] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
