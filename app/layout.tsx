import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils/utils";
import { Geist, Cinzel } from "next/font/google";
import { ErrorBoundary } from "@/components/utilities/error-boundary";
import { ServiceWorkerRegister } from "@/components/utilities/service-worker-register";
import { WebVitalsMonitor } from "@/components/utilities/web-vitals-monitor";
import { ToastContainer } from "@/components/ui/toast";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", preload: false, display: "swap" });
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sewaka — Kemewahan Tradisi, Keabadian Cinta",
    template: "%s | Sewaka",
  },
  description:
    "Rencanakan hari istimewa dengan tenang bersama Sewaka, ruang persiapan pernikahan yang menghormati tradisi Nusantara.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sewaka",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Sewaka",
    title: "Sewaka — Kemewahan Tradisi, Keabadian Cinta",
    description:
      "Rencanakan hari istimewa dengan tenang bersama Sewaka, ruang persiapan pernikahan yang menghormati tradisi Nusantara.",
  },
  other: {
    "theme-color": "#5B132B",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Sewaka",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable, cinzel.variable)} suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-0 ring-inset ring-2 ring-primary focus:opacity-100 focus:outline-none"
        >
          Langsung ke konten utama
        </a>
        <ErrorBoundary>
          {children}
          <ToastContainer />
          <ServiceWorkerRegister />
          <WebVitalsMonitor />
        </ErrorBoundary>
      </body>
    </html>
  );
}
