import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { QuickAddProvider } from "./components/QuickAddProvider";

export const metadata: Metadata = {
  title: "MediaTracker",
  description: "Track movies, shows, games, and books. See friends' reviews.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="bg-bg-base text-text-primary antialiased min-h-screen flex flex-col"
      >
        <QuickAddProvider>
          <Header />
          <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
          <footer className="border-t border-border bg-bg-surface/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center text-xs text-text-tertiary">
              Built with Next.js + Tailwind & Spring Boot
            </div>
          </footer>
        </QuickAddProvider>
      </body>
    </html>
  );
}
