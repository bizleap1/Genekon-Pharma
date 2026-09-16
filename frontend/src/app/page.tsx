import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { OfferBanner } from "@/components/home/OfferBanner";
import { ProductComparisonSection } from "@/components/home/comparison";
import { PrescriptionSection } from "@/components/home/PrescriptionSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { HealthcareHelpSection } from "@/components/home/HealthcareHelpSection";
import { CustomerTestimonials } from "@/components/home/CustomerTestimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50/30 overflow-x-hidden">
      {/* Subtle Premium Background Effects */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Soft Glowing Blobs */}
        <div className="absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px]"></div>
        <div className="absolute right-[-5%] top-[20%] h-[600px] w-[600px] rounded-full bg-teal-400/10 blur-[150px]"></div>
        <div className="absolute left-[20%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[120px]"></div>
      </div>

      <div className="relative z-50 flex flex-col w-full">
        {/* Top Header & Navigation (Untouched) */}
        <UtilityBar />
        <Header />
        <CategoryNav />
      </div>

      {/* Main Homepage Flow */}
      <main className="flex-1 pb-12 space-y-2 relative z-10">
        {/* 1. Hero (Untouched) */}
        <Hero />

        {/* 2. 4 Quick Action Cards (Untouched) */}
        <QuickActions />

        {/* 3. Shop By Category (Untouched) */}
        <CategorySection />

        {/* 4. Bestselling Products (Untouched) */}
        <ProductSection />

        {/* 5. Compare Our Products & Prices Section */}
        <ProductComparisonSection />

        {/* 6. Care More. Spend Smarter. Banner */}
        <OfferBanner />

        {/* 7. 3-Step Prescription Upload Flow */}
        <PrescriptionSection />

        {/* 8. Why Choose Genekon Section (5 Trust Cards) */}
        <WhyChooseUsSection />

        {/* 9. Need Help Finding The Right Healthcare Product? (WhatsApp CTA) */}
        <HealthcareHelpSection />

        {/* 11. Customer Testimonials (Trust-building authentic reviews) */}
        <CustomerTestimonials />

        {/* 12. Healthcare Updates Subscription (Minimal Newsletter) */}
        <NewsletterSection />
      </main>

      {/* 13. Complete Ecommerce Footer */}
      <Footer />
    </div>
  );
}
