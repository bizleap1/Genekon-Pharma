import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { QuickActions } from "@/components/home/QuickActions";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductSection } from "@/components/home/ProductSection";
import { OfferBanner } from "@/components/home/OfferBanner";
import { PrescriptionSection } from "@/components/home/PrescriptionSection";
import { WholesalePartnerSection } from "@/components/home/WholesalePartnerSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { HealthcareHelpSection } from "@/components/home/HealthcareHelpSection";
import { HealthArticles } from "@/components/home/HealthArticles";
import { CustomerTestimonials } from "@/components/home/CustomerTestimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Header & Navigation (Untouched) */}
      <UtilityBar />
      <Header />
      <CategoryNav />

      {/* Main Homepage Flow */}
      <main className="flex-1 pb-12 space-y-2">
        {/* 1. Hero (Untouched) */}
        <Hero />

        {/* 2. 4 Quick Action Cards (Untouched) */}
        <QuickActions />

        {/* 3. Shop By Category (Untouched) */}
        <CategorySection />

        {/* 4. Bestselling Products (Untouched) */}
        <ProductSection />

        {/* 5. Care More. Spend Smarter. Banner */}
        <OfferBanner />

        {/* 6. 3-Step Prescription Upload Flow */}
        <PrescriptionSection />

        {/* 7. Wholesale Healthcare Partner Section (B2B) */}
        <WholesalePartnerSection />

        {/* 8. Why Choose Genekon Section (5 Trust Cards) */}
        <WhyChooseUsSection />

        {/* 9. Need Help Finding The Right Healthcare Product? (WhatsApp CTA) */}
        <HealthcareHelpSection />

        {/* 10. Health & Wellness Insights (4 Editorial Cards) */}
        <HealthArticles />

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
