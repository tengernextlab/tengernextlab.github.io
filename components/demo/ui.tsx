"use client";

// Жишээнүүдэд (demo) хамтдаа ашиглах жижиг хэсгүүд.

import { useEffect, useState } from "react";

export function Frame({ label = "Жишээ · дарж туршаарай", sub, right, children }: { label?: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-accent/5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">{label}</p>
          {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap rounded-full border border-white/10 bg-white/5 p-1 text-xs">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full px-3 py-1.5 transition ${value === o.v ? "bg-accent font-medium text-sky-deep" : "text-slate-300 hover:text-white"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export type Tone = "good" | "warn" | "bad" | "info";
const toneCls: Record<Tone, string> = {
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  bad: "border-red-400/30 bg-red-400/10 text-red-300",
  info: "border-white/15 bg-white/5 text-slate-300",
};
const toneIcon: Record<Tone, string> = { good: "✓", warn: "!", bad: "✕", info: "•" };

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneCls[tone]}`}>
      <span aria-hidden>{toneIcon[tone]}</span>
      {children}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function Panel({ title, right, children, className = "" }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-sky-deep/60 p-4 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

const btn = "rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
export const btnMain = `${btn} bg-accent text-sky-deep hover:bg-sky-300`;
export const btnGhost = `${btn} border border-white/15 text-slate-200 hover:bg-white/5`;

/** Утасны хүрээ: дээд талд мэдэгдэл (toast) харуулна */
export function Phone({ label, time, toast, toastTitle, children }: { label: string; time: string; toast?: string | null; toastTitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-center text-xs font-medium text-slate-400">📱 {label}</p>
      <div className="mx-auto w-[280px] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-900 shadow-2xl">
        <div className="relative flex h-[540px] flex-col overflow-hidden rounded-[1.8rem] bg-slate-50 text-slate-800">
          <div className="flex items-center justify-between px-5 pb-1 pt-2 text-[10px] font-semibold text-slate-600">
            <span>{time}</span>
            <span className="h-4 w-20 rounded-full bg-slate-800" />
            <span>📶 🔋</span>
          </div>
          {toast && (
            <div className="absolute inset-x-2 top-8 z-20 rounded-2xl bg-slate-800/95 p-3 text-xs text-white shadow-xl">
              <p className="font-semibold">🔔 {toastTitle ?? "Мэдэгдэл"}</p>
              <p className="mt-0.5">{toast}</p>
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Хэдэн секундын дараа өөрөө арилдаг утга (мэдэгдэл, тодруулга) */
export function useFlash<T>(ms = 3200): [T | null, (v: T | null) => void] {
  const [v, setV] = useState<T | null>(null);
  useEffect(() => {
    if (v === null) return;
    const t = setTimeout(() => setV(null), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return [v, setV];
}

export const money = (n: number) => `${Math.round(n).toLocaleString("en-US")}₮`;
