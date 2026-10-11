import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAUSBEDROOM — Singapore | Luxury Custom Bedrooms & Modular Wardrobes",
  description: "Experience The Art of Rest. Bespoke bedroom sanctuaries, HausFlex modular wardrobe systems, and contemporary interior craftsmanship in Singapore.",
  keywords: [
    "HausBedroom",
    "HausBedroom Singapore",
    "Singapore Bedroom Design",
    "Modular Wardrobe Singapore",
    "HausFlex",
    "Custom Carpentry Singapore",
    "Luxury Bedroom Interior",
    "Eunos Technolink Showroom",
  ],
  metadataBase: new URL("https://hausbedroom.sg"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "HAUSBEDROOM — Singapore | Luxury Custom Bedrooms & Wardrobes",
    description: "The Art of Rest — Interactive Bedroom Personalisation, HausFlex Wardrobe Systems & Bespoke Carpentry.",
    url: "https://hausbedroom.sg",
    siteName: "HausBedroom Singapore",
    locale: "en_SG",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop",
        width: 2000,
        height: 1333,
        alt: "HausBedroom Modern Minimal Luxury Bedroom Sanctuary",
      },
      {
        url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 800,
        alt: "HausBedroom Bespoke Upholstered Headboard & Fluted Panels",
      },
      {
        url: "https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 800,
        alt: "HausFlex Modular Full-Metal Wardrobe System",
      },
      {
        url: "https://images.unsplash.com/photo-1540518614846-7ede433c517a?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 800,
        alt: "HausBedroom Warm Natural Bedroom Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HAUSBEDROOM — Singapore | Luxury Custom Bedrooms",
    description: "The Art of Rest — Interactive Bedroom Personalisation & Bespoke Carpentry.",
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop",
    ],
  },
};

// JSON-LD Structured Data for Search Engine & Image Indexing
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "name": "HausBedroom Singapore",
  "image": [
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop"
  ],
  "@id": "https://hausbedroom.sg/#organization",
  "url": "https://hausbedroom.sg",
  "telephone": "+6568421514",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "9 Kaki Bukit Road 1, #02-10, Eunos Technolink",
    "addressLocality": "Singapore",
    "postalCode": "415938",
    "addressCountry": "SG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 1.3361,
    "longitude": 103.9067
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "09:30",
    "closes": "18:30"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Bedroom & Modular Wardrobe Solutions",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "HausFlex Modular Full-Metal Wardrobe",
          "image": "https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop",
          "description": "Relocatable, termite & moisture resistant modular alloy wardrobe system."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Bespoke Upholstered Headboard & Wall Panels",
          "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop",
          "description": "Custom wall-to-wall acoustic fluted headboard panels."
        }
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable} scroll-smooth`}>
      <head>
        {/* Explicit Search Engine Image Indexing Directives */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, noimageindex:false" />
        <meta name="bingbot" content="index, follow, max-image-preview:large" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#42372F] selection:text-[#F6F3EE]">
        {children}
      </body>
    </html>
  );
}
