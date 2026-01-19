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

export const metadata: Metadata = {
  title: "Duory",
  description: "연인과 함께하는 특별한 추억 공간, Duory",
  keywords: ["커플", "추억", "데이트", "연애", "커뮤니티"],
  authors: [{ name: "Duory" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Duory",
  },
  icons: {
    icon: [{ url: "/logo_512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/logo_180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-pretendard: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased no-scrollbar`}
        style={{ fontFamily: "var(--font-pretendard)" }}
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
