"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  CreditCard,
  FileText,
  MessageCircle,
  ShieldCheck,
  Truck,
  Users,
  ShoppingBag,
  PlusSquare,
  RotateCcw,
  PhoneCall,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { prescriptionService } from "@/services/prescriptionService";
import { ProtectedAction } from "@/components/auth/ProtectedAction";
import { useRouter } from "next/navigation";

type OfferSlide = {
  id: number;
  eyebrow: string;
  title: string;
  description?: string;
  code?: string;
  image: string;
  href: string;
  isFullImage?: boolean;
};

const offers: OfferSlide[] = [
  {
    id: 1,
    eyebrow: "GENEKON",
    title: "Branded Se Compare Karo",
    image: "/slides/1.png",
    href: "/offers",
    isFullImage: true,
  },
  {
    id: 2,
    eyebrow: "GENEKON",
    title: "Generic Se Save Karo",
    image: "/slides/2.png",
    href: "/categories",
    isFullImage: true,
  },
  {
    id: 3,
    eyebrow: "GENEKON",
    title: "Best Savings",
    image: "/slides/3.png",
    href: "/products",
    isFullImage: true,
  },
];

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-green-100/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[25%] top-10 h-72 w-72 rounded-full bg-blue-50/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1720px] grid-cols-1 gap-5 px-5 pt-3 pb-6 lg:grid-cols-[1.2fr_1fr] lg:items-stretch lg:px-8 xl:pt-4 xl:pb-8">
        <HeroIntro />
        <RightColumn />
      </div>
    </section>
  );
};

function HeroIntro() {
  return (
    <div className="flex flex-col justify-start mt-4 lg:mt-6 lg:pr-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
        Better Health. Brighter Tomorrow.
      </p>

      <h1 className="max-w-full text-[32px] font-bold leading-[1.1] tracking-[-0.045em] md:text-[42px] xl:text-[50px] whitespace-nowrap">
        <span className="text-brand-secondary">Trusted Medicines </span><span className="text-brand-primary">for a Healthier You.</span>
      </h1>

      <div className="mt-5">
        <PrescriptionCard />
      </div>

      <div className="mt-5 grid max-w-[510px] grid-cols-3 gap-3">
        <TrustMini
          icon={<ShieldCheck />}
          title="100%"
          text="Genuine Products"
        />

        <TrustMini
          icon={<CreditCard />}
          title="Secure"
          text="Payments"
        />

        <TrustMini
          icon={<Truck />}
          title="Easy"
          text="Home Delivery"
        />
      </div>

    </div>
  );
}

function TrustMini({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2 border-r border-slate-200 last:border-r-0">
      <div className="mt-0.5 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:stroke-[#3C9820]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-[#092B4C]">{title}</p>
        <p className="mt-0.5 text-xs leading-4 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function PrescriptionCard() {
  const { isLoggedIn, openLoginModal, user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const validateFile = (selectedFile: File) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    const maxSize = 10 * 1024 * 1024;

    if (!allowed.includes(selectedFile.type)) {
      return false;
    }

    if (selectedFile.size > maxSize) {
      return false;
    }

    return true;
  };

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!validateFile(selectedFile)) {
      setStatus("error");
      return;
    }

    setFile(selectedFile);
    setStatus("idle");
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "UPLOAD_PRESCRIPTION",
          title: "Upload Prescription",
          redirectUrl: "/",
        },
        "Login required to submit and verify prescriptions"
      );
      return;
    }

    try {
      setStatus("uploading");
      const patientName = user?.name || "Patient";
      await prescriptionService.uploadPrescription(
        file,
        { patientName, customerNote: "Uploaded from homepage Hero" },
        () => {}
      );
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[24px] border border-[#E1EBE0] bg-white p-5 shadow-[0_18px_50px_rgba(30,80,50,0.07)] md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF8E8] text-[#3C9820]">
          <FileText className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#092B4C]">
            Upload Prescription
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Get medicines with ease.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 items-stretch">
        <div className="flex-1 flex flex-col">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`group flex flex-1 min-h-[175px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-5 text-center transition duration-300 ${
              dragging
                ? "border-[#3C9820] bg-[#F2FAEE]"
                : "border-[#AFD8AE] bg-[#FAFFFA] hover:border-[#3C9820] hover:bg-[#F5FBF2]"
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#3C9820] shadow-sm">
              <CloudUpload className="h-7 w-7" />
            </div>

            {file ? (
              <>
                <p className="max-w-full truncate text-sm font-semibold text-[#092B4C]">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Ready to upload
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#092B4C]">
                  Drag & drop your prescription here
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  or click to upload
                </p>

                <p className="mt-3 text-[11px] text-slate-400">
                  Supports JPG, PNG, PDF • Max 10MB
                </p>
              </>
            )}

            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
            />
          </div>

          {status === "error" && (
            <p className="mt-2 text-center text-xs font-medium text-red-500">
              Please upload a valid file under 10MB.
            </p>
          )}

          {status === "success" && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-[#3C9820]">
              <CheckCircle2 className="h-4 w-4" />
              Prescription uploaded successfully.
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <button
            onClick={handleUpload}
            disabled={status === "uploading"}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(49,95,174,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3C9820] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {status === "uploading"
              ? "Uploading..."
              : file
                ? "Upload Prescription →"
                : "Choose Prescription →"}
          </button>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/917666168147?text=Hi%20Genekon,%20I%20am%20sharing%20my%20prescription%20for%20ordering%20medicines."
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#CFE1CF] bg-white text-sm font-semibold text-[#247C2C] transition hover:border-[#3C9820] hover:bg-[#F8FFF6] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="tel:+917666168147"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#CFE1CF] bg-white text-sm font-semibold text-[#123D63] transition hover:border-[#123D63] hover:bg-[#F4F9FD] cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              Call Us
            </a>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <MicroTrust icon={<CheckCircle2 />} text="Quick Processing" />
            <MicroTrust icon={<ShieldCheck />} text="Verified Pharmacy" />
            <MicroTrust icon={<Users />} text="Safe & Confidential" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MicroTrust({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium leading-4 text-slate-500">
      <span className="[&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-[#3C9820]">
        {icon}
      </span>

      {text}
    </div>
  );
}

function RightColumn() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Half: Offer Carousel */}
      <div className="flex-1 min-h-[250px] relative rounded-[24px] overflow-hidden">
         <OfferCarousel />
      </div>

      {/* Bottom Half: 3 Quick Action Items */}
      <div className="flex flex-col gap-3">
        {/* Item 1: Order Medicines */}
        <Link href="/category/medicines" className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#DFEDE0] bg-brand-soft-blue/50 hover:shadow-sm hover:border-[#315FAE]/40 transition-all duration-200 cursor-pointer w-full">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5E5] text-[#4B8C1D] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-[#14304A]">Order Medicines</span>
              <span className="text-xs text-[#627764] mt-0.5">Search & add to cart.</span>
            </div>
          </div>
          <div className="text-[#4B8C1D] transition-transform group-hover:translate-x-0.5 relative z-10">
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 z-0 pointer-events-none overflow-hidden rounded-r-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4FAF8] via-transparent to-transparent z-10" />
            <img src="/images/categories/prescription-medicines.jpg" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" alt="" />
          </div>
        </Link>

        {/* Item 2: Healthcare Essentials */}
        <Link href="/category/healthcare" className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#DCE8F7] bg-brand-soft-blue/50 hover:shadow-sm hover:border-[#315FAE]/40 transition-all duration-200 cursor-pointer w-full">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2FC] text-brand-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <PlusSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-[#14304A]">Healthcare Essentials</span>
              <span className="text-xs text-[#627764] mt-0.5">Everything for your health.</span>
            </div>
          </div>
          <div className="text-brand-primary transition-transform group-hover:translate-x-0.5 relative z-10">
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 z-0 pointer-events-none overflow-hidden rounded-r-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4FAF8] via-transparent to-transparent z-10" />
            <img src="/images/categories/wellness-essentials.jpg" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" alt="" />
          </div>
        </Link>

        {/* Item 3: Repeat Previous Order */}
        <ProtectedAction
          action={{
            type: "TRACK_ORDER",
            title: "Repeat Previous Order",
            redirectUrl: "/account/orders",
          }}
          onAction={() => router.push("/account/orders")}
        >
          <div className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#DFEDE0] bg-brand-soft-blue/50 hover:shadow-sm hover:border-[#315FAE]/40 transition-all duration-200 cursor-pointer w-full">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5E5] text-[#4B8C1D] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#14304A]">Repeat Previous Order</span>
                <span className="text-xs text-[#627764] mt-0.5">Quick & hassle-free.</span>
              </div>
            </div>
            <div className="text-[#4B8C1D] transition-transform group-hover:translate-x-0.5 relative z-10">
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 z-0 pointer-events-none overflow-hidden rounded-r-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F4FAF8] via-transparent to-transparent z-10" />
              <img src="/images/categories/personal-care.jpg" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
          </div>
        </ProtectedAction>
      </div>
    </div>
  );
}

function OfferCarousel() {
  const [active, setActive] = useState(0);

  const next = () => {
    setActive((current) => (current + 1) % offers.length);
  };

  const previous = () => {
    setActive(
      (current) => (current - 1 + offers.length) % offers.length
    );
  };

  useEffect(() => {
    const interval = window.setInterval(next, 3000);

    return () => window.clearInterval(interval);
  }, []);

  // Fallback to offers[0] if active is out of bounds (happens during hot-reloads)
  const offer = offers[active] || offers[0];

  return (
    <div className="relative flex-1 min-h-[250px] w-full overflow-hidden rounded-[24px] border border-[#E1EAE5] bg-[#F4FAF3] shadow-[0_18px_50px_rgba(30,80,50,0.07)]">
      {offers.map((item, idx) => (
        <img
          key={item.id}
          src={item.image}
          alt={item.title}
          className={`absolute inset-0 h-full w-full object-cover scale-[1.05] transition-opacity duration-700 ${
            active === idx ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        />
      ))}

      {!offer.isFullImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-10 pointer-events-none" />

          <div className="relative z-20 flex h-full max-w-[70%] flex-col justify-center p-6 xl:p-8 transition-opacity duration-500 pointer-events-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
              {offer.eyebrow}
            </p>

            {offer.title.includes("%") ? (
              <span className="mt-3 inline-flex w-fit items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-2xl font-extrabold tracking-[-0.04em] xl:text-3xl shadow-sm">
                {offer.title}
              </span>
            ) : (
              <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-brand-secondary xl:text-3xl">
                {offer.title}
              </h3>
            )}

            {offer.description && (
              <p className="mt-2 max-w-[280px] text-xs leading-5 text-slate-600">
                {offer.description}
              </p>
            )}

            {offer.code && (
              <div className="mt-3 text-xs text-[#17384F]">
                Use Code:{" "}
                <span className="rounded-full bg-[#198C49] px-2 py-0.5 font-bold text-white">
                  {offer.code}
                </span>
              </div>
            )}

            <Link
              href={offer.href}
              className="mt-4 inline-flex w-fit items-center rounded-full bg-brand-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-secondary"
            >
              Explore Now →
            </Link>
          </div>
        </>
      )}

      {offer.isFullImage && (
        <Link href={offer.href} className="absolute inset-0 z-20 block" aria-label="Explore Offer" />
      )}


      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {offers.map((item, index) => (
          <button
            key={item.id}
            aria-label={`Show offer ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              active === index
                ? "w-7 bg-[#3C9820]"
                : "w-2 bg-white/80 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
