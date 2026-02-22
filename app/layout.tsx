import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { BodyRouteStyle } from "@/components/body-route-style";
import { ConditionalFooter } from "@/components/conditional-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://monera.com'),
  title: {
    default: "Monera - Hire Top 5% Indonesian Remote Talent | Save 60% on Costs",
    template: "%s | Monera"
  },
  description: "Build your dedicated remote team with Indonesia's top 5% talent. Full HR & payroll management. 30-day replacement guarantee. Get 3 pre-vetted candidates in 48 hours. Save up to 60% on operational costs.",
  keywords: [
    "remote team Indonesia",
    "hire Indonesian talent",
    "dedicated remote team",
    "Indonesian developers",
    "remote staff Indonesia",
    "offshore team Indonesia",
    "virtual assistant Indonesia",
    "remote hiring Indonesia",
    "Indonesian remote workers",
    "cost-effective remote team",
    "managed remote team",
    "full-time remote talent",
    "vetted remote professionals",
    "remote team building"
  ],
  category: "Business Services",
  authors: [{ name: "Monera" }],
  creator: "Monera",
  publisher: "Monera",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Monera",
    title: "Monera - Build Your Dedicated Remote Team | Top 5% Indonesian Talent",
    description: "Save up to 60% on costs with full-time dedicated Indonesian professionals. Complete HR & payroll management. 30-day replacement guarantee. Get 3 pre-vetted candidates in 48 hours.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Monera - Premium Talent Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monera - Build Your Dedicated Remote Team | Top 5% Indonesian Talent",
    description: "Save up to 60% on costs with full-time dedicated Indonesian professionals. Complete HR & payroll management. 30-day replacement guarantee.",
    images: ["/images/og-image.png"],
    creator: "@monera",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/apple-touch-icon.png',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn-icons-png.flaticon.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <AuthProvider>
          <BodyRouteStyle />
          <ConditionalNavbar />
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
