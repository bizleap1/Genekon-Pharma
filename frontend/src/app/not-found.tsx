import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Home, ArrowRight, ShieldCheck, Pill } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { CategoryNav } from "@/components/layout/CategoryNav";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA] text-[#14304A]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <Container className="max-w-xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D5E4D2]">
            <Pill className="w-3.5 h-3.5 text-[#559620]" />
            <span>Page Not Found</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#14304A] tracking-tight">
            404
          </h1>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A] mt-2">
            The healthcare page you requested cannot be found
          </h2>

          <p className="text-xs sm:text-sm text-[#5D7360] mt-3 mb-8 max-w-md mx-auto leading-relaxed">
            The page may have been moved, updated, or does not exist. You can browse our medicines catalog or search for specific formulations.
          </p>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>

            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs sm:text-sm font-bold text-[#14304A] transition-colors"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#559620]" />
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="rounded-2xl border border-[#E3EDE1] bg-white p-5 text-left shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#697E6B] mb-3">
              Popular Healthcare Destinations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-[#14304A]">
              <Link href="/category/medicines" className="p-2 rounded-lg hover:bg-[#F2F7F1] hover:text-[#559620] transition-colors">
                &rarr; Medicines
              </Link>
              <Link href="/category/vitamins-nutrition" className="p-2 rounded-lg hover:bg-[#F2F7F1] hover:text-[#559620] transition-colors">
                &rarr; Vitamins
              </Link>
              <Link href="/prescription/upload" className="p-2 rounded-lg hover:bg-[#F2F7F1] hover:text-[#559620] transition-colors">
                &rarr; Upload Rx
              </Link>
              <Link href="/track-order" className="p-2 rounded-lg hover:bg-[#F2F7F1] hover:text-[#559620] transition-colors">
                &rarr; Track Order
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
