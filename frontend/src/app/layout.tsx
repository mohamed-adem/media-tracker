import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { QuickAddProvider } from "./components/QuickAddProvider";

export const metadata: Metadata = {
  title: "Media Tracker — your culture, in one place",
  description: "Keep a personal library of the movies, shows, games, and books that shape your taste.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-bg-base text-text-primary antialiased"
      >
        <QuickAddProvider>
          <Header />
          <main className="page-shell">{children}</main>
          <footer className="mt-14 border-t border-ink/15">
            <div className="mx-auto flex min-h-20 w-full max-w-[1440px] items-center justify-between gap-4 px-4 text-xs text-text-tertiary sm:px-6 lg:px-10">
              <span>Media Tracker</span>
              <span>Movies · shows · games · books</span>
            </div>
          </footer>
        </QuickAddProvider>
      </body>
    </html>
  );
}
