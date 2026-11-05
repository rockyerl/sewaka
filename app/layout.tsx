import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Geist, Cinzel } from "next/font/google";
import { ErrorBoundary } from "@/core/error-boundary";
import { ThemeProvider } from "@/shared/providers/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: {
    default: "Sewaka — Kemewahan Tradisi, Keabadian Cinta",
    template: "%s | Sewaka",
  },
  description:
    "Rencanakan hari istimewa dengan tenang bersama Sewaka, ruang persiapan pernikahan yang menghormati tradisi Nusantara.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable, cinzel.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
