"use client";

import { useState } from "react";
import { demos } from "@/lib/dataAnalysis";

const fmt = (n: number, d = 1) => n.toLocaleString("mn-MN", { minimumFractionDigits: d, maximumFractionDigits: d });

function Toggle<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full px-3 py-1.5 transition ${
            value === o.v ? "bg-accent font-medium text-sky-deep" : "text-slate-300 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function DemoDashboard() {
  const [ind, setInd] = useState(demos[0].id);
  const demo = demos.find((d) => d.id === ind) ?? demos[0];
  const [period, setPeriod] = useState<"6" | "12">("12");
  const [metric, setMetric] = useState<"revenue" | "profit">("revenue");
  const [sortBy, setSortBy] = useState<"profit" | "units">("units");
  const [hover, setHover] = useState<number | null>(null);
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const months = period === "6" ? demo.months.slice(-6) : demo.months;
  const revenue = months.reduce((s, m) => s + m.revenue, 0);
  const profit = months.reduce((s, m) => s + m.profit, 0);
  const best = months.reduce((a, b) => (b.revenue > a.revenue ? b : a));
  const max = Math.max(...months.map((m) => m[metric])) * 1.12; // дээр нь tooltip-д зай үлдээнэ

  const products = [...demo.products].sort((a, b) => b[sortBy] - a[sortBy]);
  const maxProd = Math.max(...products.map((p) => p[sortBy]));

  const maxDay = Math.max(...demo.weekdays.map((d) => d.v));

  const kpis = [
    { label: "Нийт орлого", value: `${fmt(revenue)} сая ₮` },
    { label: "Цэвэр ашиг", value: `${fmt(profit)} сая ₮` },
    { label: "Ашгийн хувь", value: `${fmt((profit / revenue) * 100)}%` },
    { label: "Хамгийн сайн сар", value: best.m },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-accent/5 sm:p-6">
      {/* Самбарын толгой */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">Жишээ самбар · дарж туршаарай</p>
          <p className="mt-1 text-sm text-slate-400">{demo.business}</p>
        </div>
        <div className="flex flex-wrap gap-2">
        <Toggle
          label="Салбар"
          value={ind}
          onChange={(v) => {
            setInd(v);
            setHover(null);
          }}
          options={demos.map((d) => ({ v: d.id, label: d.label }))}
        />
        <Toggle
          label="Хугацаа"
          value={period}
          onChange={setPeriod}
          options={[
            { v: "6", label: "Сүүлийн 6 сар" },
            { v: "12", label: "Бүтэн жил" },
          ]}
        />
        </div>
      </div>

      {/* KPI */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
            <dt className="text-xs text-slate-400">{k.label}</dt>
            <dd className="mt-1 text-xl font-bold text-white sm:text-2xl">{k.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 grid gap-3 lg:grid-cols-5">
        {/* Сарын график */}
        <div className="lg:col-span-3">
          <Card
            title={metric === "revenue" ? "Сарын орлого (сая ₮)" : "Сарын цэвэр ашиг (сая ₮)"}
            right={
              <Toggle
                label="Үзүүлэлт"
                value={metric}
                onChange={setMetric}
                options={[
                  { v: "revenue", label: "Орлого" },
                  { v: "profit", label: "Ашиг" },
                ]}
              />
            }
          >
            <div className="relative flex h-56 items-end gap-[2px] border-b border-white/15 sm:gap-1.5">
              {/* хэвтээ туслах шугам */}
              {[0.25, 0.5, 0.75].map((f) => (
                <div key={f} className="pointer-events-none absolute inset-x-0 border-t border-white/5" style={{ bottom: `${f * 100}%` }} />
              ))}
              {months.map((m, i) => {
                const v = m[metric];
                return (
                  <div
                    key={m.m}
                    className="relative flex h-full flex-1 items-end"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setHover(i)}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        hover === null || hover === i ? "bg-accent" : "bg-accent/40"
                      }`}
                      style={{ height: `${(v / max) * 100}%` }}
                    />
                    {hover === i && (
                      <div
                        style={{ bottom: `calc(${(v / max) * 100}% + 6px)` }}
                        className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-sky-night px-3 py-2 text-xs shadow-lg">
                        <p className="text-slate-400">{m.m}</p>
                        <p className="font-semibold text-white">{fmt(v)} сая ₮</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-[2px] text-center text-[10px] text-slate-500 sm:gap-1.5">
              {months.map((m) => (
                <span key={m.m} className="flex-1 truncate">
                  {m.m.replace("-р сар", "")}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Гарагийн ачаалал */}
        <div className="lg:col-span-2">
          <Card title="Гарагийн дундаж борлуулалт (сая ₮)">
            <div className="relative flex h-56 items-end gap-2 border-b border-white/15">
              {demo.weekdays.map((d, i) => (
                <div
                  key={d.d}
                  className="relative flex h-full flex-1 items-end"
                  onMouseEnter={() => setHoverDay(i)}
                  onMouseLeave={() => setHoverDay(null)}
                  onClick={() => setHoverDay(i)}
                >
                  <div
                    className={`w-full rounded-t ${d.v === maxDay ? "bg-accent" : "bg-accent/45"}`}
                    style={{ height: `${(d.v / maxDay) * 100}%` }}
                  />
                  {hoverDay === i && (
                    <div
                      style={{ bottom: `calc(${(d.v / maxDay) * 100}% + 6px)` }}
                      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-sky-night px-3 py-2 text-xs shadow-lg">
                      <p className="font-semibold text-white">{fmt(d.v, 2)} сая ₮</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2 text-center text-[10px] text-slate-500">
              {demo.weekdays.map((d) => (
                <span key={d.d} className="flex-1">
                  {d.d}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-5">
        {/* Бараа */}
        <div className="lg:col-span-3">
          <Card
            title={sortBy === "units" ? `${demo.itemsLabel} — тоогоор` : `${demo.itemsLabel} — цэвэр ашгаар`}
            right={
              <Toggle
                label="Эрэмбэ"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { v: "units", label: "Тоогоор" },
                  { v: "profit", label: "Ашгаар" },
                ]}
              />
            }
          >
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={p.name}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-slate-300">{p.name}</span>
                    <span className="shrink-0 font-medium text-white">
                      {sortBy === "units" ? `${p.units.toLocaleString("mn-MN")} ${demo.unit}` : `${fmt(p.profit)} сая ₮`}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${(p[sortBy] / maxProd) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              «Тоогоор» ба «Ашгаар» хооронд сольж үзээрэй — хамгийн их борлогддог зүйл хамгийн ашигтай нь биш байдаг.
            </p>
          </Card>
        </div>

        {/* Дүгнэлт */}
        <div className="lg:col-span-2">
          <Card title="Самбараас гарсан дүгнэлт">
            <ol className="space-y-3">
              {demo.insights.map((t, i) => (
                <li key={t} className="flex gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
