import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { ServiceWorkerCleanup } from "@/components/layout/ServiceWorkerCleanup";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "IAgora", template: "%s | IAgora" },
  description: "Plataforma para gerar, publicar e descobrir receitas com apoio de IA.",
  manifest: "/manifest.json",
  applicationName: "IAgora",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", rel: "shortcut icon" },
      { url: "/brand-icon-192.png?v=4", type: "image/png", sizes: "192x192" },
      { url: "/brand-icon.png?v=4", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: "IAgora",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ServiceWorkerCleanup />
        <WebVitalsReporter />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
