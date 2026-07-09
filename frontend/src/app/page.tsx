"use client";

import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const r = useRouter();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    const loggedIn = isLoggedIn();
    setAuthed(loggedIn);
    if (loggedIn) {
      r.replace("/dashboard");
    }
  }, [r]);

  return (
    <div className="animate-fade-in-up">
      <section className="grid min-h-[72vh] items-center gap-12 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Movies, shows, games, and books</p>
          <h1 className="display-title mt-5 max-w-2xl">
            Keep track of everything you watch, play, and read.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary">
            Save titles, track your progress, write reviews, make lists, and see what your friends enjoyed.
          </p>
          {!authed && (
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn">Start your library</Link>
              <Link href="/login" className="btn-outline">I already have one</Link>
            </div>
          )}
          <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-ink/15 py-5">
            <Metric value="4" label="media types" />
            <Metric value="3" label="search sources" />
            <Metric value="½" label="star precision" />
          </div>
        </div>

        <div className="relative mx-auto h-[30rem] w-full max-w-lg" aria-hidden="true">
          <div className="absolute left-[8%] top-[8%] h-72 w-48 -rotate-6 rounded-[1.7rem] bg-[#364936] p-5 text-paper shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Book 042</span>
            <div className="mt-24 font-serif text-4xl leading-none">The quiet shelf</div>
            <div className="mt-5 h-px bg-white/30" />
          </div>
          <div className="absolute right-[5%] top-[18%] h-72 w-48 rotate-6 rounded-[1.7rem] bg-[#ecb94f] p-5 text-ink shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">Film 118</span>
            <div className="mt-28 text-5xl font-black">02:14</div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider">Worth remembering</p>
          </div>
          <div className="absolute bottom-[2%] left-[28%] h-64 w-48 -rotate-1 rounded-[1.7rem] bg-accent p-5 text-white shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Game 027</span>
            <div className="mt-16 text-7xl font-black leading-none">9.0</div>
            <p className="mt-4 max-w-[8rem] text-sm leading-5">The one I could not put down.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <Feature number="01" title="One library">Keep movies, series, games, and books in the same collection.</Feature>
          <Feature number="02" title="Track and review">Update your progress, use half-star ratings, and save written reviews.</Feature>
          <Feature number="03" title="Share with friends">See friends’ public reviews and get suggestions from titles they rated highly.</Feature>
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-text-tertiary">{label}</div>
    </div>
  );
}

function Feature({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <article>
      <span className="text-xs font-bold text-accent">{number}</span>
      <h2 className="mt-3 font-serif text-2xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{children}</p>
    </article>
  );
}
