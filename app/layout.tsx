import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Political Compass",
  description: "Interactive political compass map with notable people",
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
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-100 border-t py-4">
            <div className="max-w-7xl mx-auto px-4 flex justify-center gap-6 text-sm text-gray-600">
              <a href="/impressum" className="hover:text-gray-900 hover:underline">
                Impressum
              </a>
              <span className="text-gray-400">|</span>
              <a href="/datenschutz" className="hover:text-gray-900 hover:underline">
                Datenschutz
              </a>
            </div>
          </footer>
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
