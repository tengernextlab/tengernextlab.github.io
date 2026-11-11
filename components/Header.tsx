"use client";

import { useEffect, useState } from "react";
import { base, company, nav } from "@/lib/content";
import Logo from "./Logo";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open ? "bg-sky-deep/90 backdrop-blur border-b border-white/10" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href={`${base}/`} className="flex items-center gap-2 font-semibold text-white">
          <Logo />
          {company.name}
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-slate-300 hover:text-white">
              {item.label}
            </a>
          ))}
          <a
            href={`${base}/#contact`}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-sky-deep hover:bg-sky-300"
          >
            Хамтран ажиллах
          </a>
        </nav>

        <button
          className="lg:hidden text-white"
          aria-label="Цэс"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 px-4 pb-4 lg:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
