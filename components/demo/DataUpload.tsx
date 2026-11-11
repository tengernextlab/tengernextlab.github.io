"use client";

// «Өөрийн файлаар туршаад үз» — хэрэглэгчийн CSV файлыг зөвхөн хөтөч дотор нь шинжилнэ.
// Файл хаашаа ч илгээгдэхгүй.

import { useMemo, useState } from "react";
import { Panel, Stat, btnGhost, btnMain, money } from "./ui";

type Table = { headers: string[]; rows: string[][] };

function parseCSV(text: string): Table {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/)[0] ?? "";
  const delim = [";", "\t", ","].reduce((best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best), ",");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  const headers = (rows.shift() ?? []).map((h) => h.trim());
  return { headers, rows };
}

const toNumber = (s: string) => {
  const n = Number(String(s).replace(/[\s₮,]/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

// 2026-03-15, 2026/3/15, 15.03.2026, 15/03/2026 → "2026-03"
const toMonth = (s: string) => {
  const t = s.trim();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}`;
  return null;
};

const guess = (headers: string[], words: string[]) => {
  const i = headers.findIndex((h) => words.some((w) => h.toLowerCase().includes(w)));
  return i;
};

const SAMPLE = [
  "Огноо,Бараа,Тоо,Дүн",
  ...[
    ["2026-01-05", "Гурил", 3, 156000], ["2026-01-12", "Сүү", 40, 152000], ["2026-01-20", "Будаа", 6, 126000], ["2026-01-28", "Ундаа", 60, 150000],
    ["2026-02-03", "Гурил", 4, 208000], ["2026-02-11", "Сүү", 35, 133000], ["2026-02-19", "Мах", 12, 264000], ["2026-02-26", "Ундаа", 48, 120000],
    ["2026-03-04", "Мах", 15, 330000], ["2026-03-10", "Гурил", 5, 260000], ["2026-03-18", "Сүү", 44, 167200], ["2026-03-25", "Будаа", 8, 168000],
    ["2026-04-02", "Мах", 18, 396000], ["2026-04-14", "Ундаа", 70, 175000], ["2026-04-22", "Гурил", 4, 208000], ["2026-04-29", "Сүү", 50, 190000],
  ].map((r) => r.join(",")),
].join("\n");

export default function DataUpload() {
  const [table, setTable] = useState<Table | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dateCol, setDateCol] = useState(-1);
  const [itemCol, setItemCol] = useState(-1);
  const [amountCol, setAmountCol] = useState(-1);

  const load = (text: string, name: string) => {
    try {
      const t = parseCSV(text);
      if (t.headers.length < 2 || t.rows.length === 0) throw new Error("empty");
      setTable(t);
      setFileName(name);
      setError("");
      setDateCol(guess(t.headers, ["огноо", "date", "өдөр", "сар", "күн", "дата"]));
      setItemCol(guess(t.headers, ["бараа", "нэр", "product", "item", "ангилал", "category", "тауар", "үйлчилгээ"]));
      const a = guess(t.headers, ["дүн", "amount", "total", "нийт", "орлого", "сома", "sum", "үнэ", "price"]);
      setAmountCol(a >= 0 ? a : t.headers.length - 1);
    } catch {
      setTable(null);
      setError("Файлыг уншиж чадсангүй. Эхний мөрөнд баганын нэр бүхий CSV файл байх хэрэгтэй.");
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!/\.(csv|txt|tsv)$/i.test(f.name)) {
      setError("Одоогоор CSV файл дэмжинэ. Excel дээр «Save As → CSV» гэж хадгалаад оруулна уу.");
      return;
    }
    const r = new FileReader();
    r.onload = () => load(String(r.result ?? ""), f.name);
    r.readAsText(f, "utf-8");
  };

  const downloadSample = () => {
    const blob = new Blob(["﻿" + SAMPLE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jishee-borluulalt.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const result = useMemo(() => {
    if (!table || amountCol < 0) return null;
    let total = 0, count = 0;
    const byItem = new Map<string, number>();
    const byMonth = new Map<string, number>();
    for (const r of table.rows) {
      const v = toNumber(r[amountCol] ?? "");
      if (Number.isNaN(v)) continue;
      total += v; count++;
      if (itemCol >= 0) { const k = (r[itemCol] ?? "").trim() || "(хоосон)"; byItem.set(k, (byItem.get(k) ?? 0) + v); }
      if (dateCol >= 0) { const m = toMonth(r[dateCol] ?? ""); if (m) byMonth.set(m, (byMonth.get(m) ?? 0) + v); }
    }
    const items = Array.from(byItem.entries()).sort((a, b) => b[1] - a[1]);
    const months = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return { total, count, items, months };
  }, [table, amountCol, itemCol, dateCol]);

  const sel = (label: string, value: number, set: (n: number) => void, optional = true) => (
    <label className="text-xs text-slate-400">
      {label}
      <select value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-white/10 bg-sky-deep px-2 py-1.5 text-sm text-white">
        {optional && <option value={-1}>— байхгүй —</option>}
        {table?.headers.map((h, i) => <option key={i} value={i}>{h || `Багана ${i + 1}`}</option>)}
      </select>
    </label>
  );

  const topItems = result?.items.slice(0, 6) ?? [];
  const maxItem = Math.max(1, ...topItems.map((x) => x[1]));
  const maxMonth = Math.max(1, ...(result?.months.map((x) => x[1]) ?? [1]));
  const best = result?.months.length ? result.months.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
  const share = result && topItems.length ? Math.round((topItems[0][1] / result.total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">Өөрийн файлаар туршаад үзээрэй</p>
          <p className="mt-1 text-sm text-slate-300">Борлуулалтынхаа CSV файлыг оруулбал хэдхэн секундэд дүн, шилдэг бараа, сарын графикийг гаргана.</p>
          <p className="mt-1 text-xs text-emerald-300">🔒 Файл таны компьютерээс гарахгүй — зөвхөн энэ хуудас дотор боловсруулагдана.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <label className={`${btnMain} cursor-pointer`}>
            📂 Файл сонгох
            <input type="file" accept=".csv,.txt,.tsv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <button className={btnGhost} onClick={downloadSample}>⬇ Жишээ файл татах</button>
          <button className={btnGhost} onClick={() => load(SAMPLE, "jishee-borluulalt.csv")}>Жишээгээр турших</button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

      {table && result && (
        <div className="mt-5 space-y-3">
          <Panel title={`📄 ${fileName} · ${table.rows.length} мөр`}>
            <div className="grid gap-3 sm:grid-cols-3">
              {sel("Огнооны багана", dateCol, setDateCol)}
              {sel("Бараа / ангиллын багана", itemCol, setItemCol)}
              {sel("Дүнгийн багана", amountCol, setAmountCol, false)}
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Нийт дүн" value={money(result.total)} />
            <Stat label="Гүйлгээ" value={result.count} />
            <Stat label="Дундаж" value={money(result.count ? result.total / result.count : 0)} />
            <Stat label="Хамгийн сайн сар" value={best ? best[0] : "—"} />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Panel title="Шилдэг бараа / ангилал">
              {topItems.length === 0 ? (
                <p className="text-sm text-slate-500">Бараа, ангиллын багана сонгоно уу.</p>
              ) : (
                <ul className="space-y-3">
                  {topItems.map(([k, v]) => (
                    <li key={k}>
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="truncate text-slate-300">{k}</span>
                        <span className="shrink-0 font-medium text-white">{money(v)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/5">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${(v / maxItem) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title="Сар бүрийн дүн">
              {result.months.length === 0 ? (
                <p className="text-sm text-slate-500">Огнооны багана сонгоно уу (жишээ нь 2026-03-15 эсвэл 15.03.2026).</p>
              ) : (
                <>
                  <div className="flex h-40 items-end gap-1.5 border-b border-white/15">
                    {result.months.map(([m, v]) => (
                      <div key={m} className="group relative flex h-full flex-1 items-end" title={`${m}: ${money(v)}`}>
                        <div className="w-full rounded-t bg-accent" style={{ height: `${(v / maxMonth) * 100}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-1.5 text-center text-[10px] text-slate-500">
                    {result.months.map(([m]) => <span key={m} className="flex-1 truncate">{m.slice(2)}</span>)}
                  </div>
                </>
              )}
            </Panel>
          </div>

          {topItems.length > 0 && (
            <p className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-sky-100">
              💡 «{topItems[0][0]}» нийт дүнгийн {share}%-ийг бүрдүүлж байна{best ? `, хамгийн сайн сар нь ${best[0]}` : ""}. Бүрэн шинжилгээнд ашиг, зардал, улирлын хэлбэлзэл, таамаглалыг нэмж гаргана.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
