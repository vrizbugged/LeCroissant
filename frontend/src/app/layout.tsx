import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Le Croissant",
    template: "%s | Le Croissant",
  },
  description: "Le Croissant - Fresh pastry for your business and daily delight.",
  icons: {
    icon: "/image/Lecroissant_logo.png",
    shortcut: "/image/Lecroissant_logo.png",
    apple: "/image/Lecroissant_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
