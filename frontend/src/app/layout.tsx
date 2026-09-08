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
  title: {
    default: "GENEKON | Genuine Medicines & Healthcare Essentials",
    template: "%s | GENEKON Pharmaceuticals",
  },
  description:
    "GENEKON Pharmaceuticals Pvt. Ltd. — Care for today. Healthier tomorrow. A wide range of genuine medicines, healthcare products and wellness essentials delivered with care.",
  keywords: [
    "Genekon",
    "Genekon Pharmaceuticals",
    "online pharmacy",
    "genuine medicines",
    "buy medicines online",
    "prescription drugs",
    "healthcare products",
    "wellness essentials",
    "India pharmacy delivery",
  ],
  authors: [{ name: "GENEKON Pharmaceuticals Pvt. Ltd." }],
  creator: "GENEKON Pharmaceuticals",
  publisher: "GENEKON Pharmaceuticals",
  metadataBase: new URL("https://genekonpharma.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GENEKON | Genuine Medicines & Healthcare Essentials",
    description:
      "GENEKON Pharmaceuticals Pvt. Ltd. — Care for today. Healthier tomorrow. Certified medicines and healthcare essentials delivered safely to your doorstep.",
    url: "https://genekonpharma.com",
    siteName: "GENEKON Pharmaceuticals",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GENEKON Pharmaceuticals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GENEKON | Genuine Medicines & Healthcare Essentials",
    description:
      "GENEKON Pharmaceuticals Pvt. Ltd. — Genuine medicines and healthcare essentials delivered with care.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/genekon-icon.png",
    shortcut: "/images/genekon-icon.png",
    apple: "/images/genekon-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Pharmacy",
  name: "GENEKON Pharmaceuticals Pvt. Ltd.",
  url: "https://genekonpharma.com",
  logo: "https://genekonpharma.com/images/genekon-logo.png",
  description:
    "Care for today. Healthier tomorrow. A wide range of genuine medicines, healthcare products and wellness essentials.",
  telephone: "+91-1800-GENEKON",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Pharma City, Sector 62",
    addressLocality: "Noida",
    addressRegion: "Uttar Pradesh",
    postalCode: "201301",
    addressCountry: "IN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "22:00",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#14304A] antialiased selection:bg-[#F3F8EE] selection:text-[#69A82F]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
