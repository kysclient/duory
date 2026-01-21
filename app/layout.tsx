import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/components/auth-gate";
import { RegisterServiceWorker } from "@/components/register-sw";
import { Toaster } from "@/components/ui/sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Safe Area 지원 (notch, home indicator 등)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF5A8E" },
    { media: "(prefers-color-scheme: dark)", color: "#FF6B9D" },
  ],
};

const naverSiteVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://duory.app";
const ogImageUrl = new URL("/logo_512.png", siteUrl);

export const metadata: Metadata = {
  title: {
    default: "듀오리(Duory) | 우리 둘만의 소중한 기록",
    template: "%s | 듀오리(Duory)"
  },
  description: "둘만의 특별한 순간을 기록하고 공유하는 공간, 듀오리. 우리만의 피드, 커뮤니티, 그리고 잊지 못할 기념일 관리까지 시작해보세요.",
  keywords: ["커플앱", "커플기록", "기념일관리", "연애기록", "커플피드", "커플일기", "듀오리", "Duory"],
  applicationName: "Duory",
  authors: [{ name: "Duory Team" }],
  creator: "Duory",
  publisher: "Duory",
  category: "Lifestyle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "듀오리(Duory) | 우리 둘만의 소중한 기록",
    description: "둘만의 특별한 순간을 기록하고 공유하는 공간, 듀오리. 지금 우리만의 추억을 쌓아보세요.",
    url: siteUrl,
    siteName: "Duory",
    images: [
      {
        url: ogImageUrl,
        width: 512,
        height: 512,
        alt: "Duory - 우리 둘만의 기록",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "듀오리(Duory) | 우리 둘만의 소중한 기록",
    description: "연인과 함께하는 가장 설레는 기록 공간",
    images: [ogImageUrl],
  },
  verification: naverSiteVerification
    ? { other: { "naver-site-verification": naverSiteVerification } }
    : undefined,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Duory",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo_512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/logo_180.png", sizes: "180x180", type: "image/png" }
    ],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Duory",
      "url": siteUrl,
      "logo": ogImageUrl.toString(),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "듀오리 (Duory)",
      "url": siteUrl,
      "inLanguage": "ko-KR",
      "description": "연인과 함께하는 우리만의 소중한 기록 공간",
      "publisher": {
        "@type": "Organization",
        "name": "Duory",
        "url": "https://duory.app",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "듀오리 (Duory)",
      "description": "연인과 함께하는 우리만의 소중한 기록 공간",
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "iOS, Android, Windows, macOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1024"
      }
    }
  ];

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-gmarket: "GmarketSans", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased no-scrollbar`}
        style={{ fontFamily: "var(--font-gmarket)" }}
      >
        <RegisterServiceWorker />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
