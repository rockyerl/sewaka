import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Geist, Cinzel } from "next/font/google";
import { ErrorBoundary } from "@/core/error-boundary";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { WebVitalsMonitor } from "@/components/web-vitals-monitor";

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
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192" },
    ],
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
        <ThemeProvider>
          <ErrorBoundary>
            {children}
            <ServiceWorkerRegister />
            <WebVitalsMonitor />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
