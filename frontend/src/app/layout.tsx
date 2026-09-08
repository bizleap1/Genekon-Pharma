import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GENEKON | Genuine Medicines & Healthcare Essentials",
  description:
    "GENEKON Pharmaceuticals Pvt. Ltd. — Care for today. Healthier tomorrow. A wide range of genuine medicines, healthcare products and wellness essentials delivered with care.",
  icons: {
    icon: "/images/genekon-icon.png",
    shortcut: "/images/genekon-icon.png",
    apple: "/images/genekon-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plusJakarta.variable} ${dmSerifDisplay.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[#14304A] antialiased selection:bg-[#F3F8EE] selection:text-[#69A82F]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
