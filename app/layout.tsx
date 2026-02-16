import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { BodyRouteStyle } from "@/components/body-route-style";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://monera.com'),
  title: {
    default: "Monera | Hire Vetted Remote Talent",
    template: "%s | Monera"
  },
  description: "Monera is a quality-first talent platform connecting businesses with pre-screened remote professionals. Find vetted talent, independent contractors, and remote professionals. AI-powered matching, pre-validated profiles, and smart hiring tools for quality-focused companies.",
  keywords: [
    "talent marketplace",
    "remote talent",
    "vetted talent",
    "hire talent",
    "remote professionals",
    "independent contractors",
    "talent platform",
    "pre-screened talent",
    "quality talent",
    "remote hiring",
    "talent marketplace platform",
    "find talent",
    "hire remote workers",
    "freelance platform",
    "remote work",
    "talent matching",
    "AI-powered hiring"
  ],
  authors: [{ name: "Monera" }],
  creator: "Monera",
  publisher: "Monera",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Monera",
    title: "Monera - Premium Talent Marketplace | Hire Vetted Remote Talent",
    description: "Connect with pre-screened remote professionals and vetted talent. Quality-first hiring platform with AI-powered matching.",
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
    title: "Monera - Premium Talent Marketplace | Hire Vetted Remote Talent",
    description: "Connect with pre-screened remote professionals and vetted talent. Quality-first hiring platform with AI-powered matching.",
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
      <body className="min-h-screen flex flex-col bg-transparent">
        <AuthProvider>
          <BodyRouteStyle />
          <ConditionalNavbar />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
