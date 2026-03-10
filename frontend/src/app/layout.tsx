import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediaTracker",
  description: "Track movies, shows, games, and books. See friends' reviews.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-bg-base text-text-primary antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
        <footer className="border-t border-border bg-bg-surface/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center text-xs text-text-tertiary">
            Built with Next.js + Tailwind & Spring Boot
          </div>
        </footer>
      </body>
    </html>
  );
}
