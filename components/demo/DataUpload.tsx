"use client";

// «Өөрийн файлаар туршаад үз» — CSV эсвэл Excel (.xlsx) файлыг зөвхөн хөтөч дотор нь шинжилнэ.
// Файл хаашаа ч илгээгдэхгүй.

import { useMemo, useState } from "react";
import { Panel, Stat, btnGhost, btnMain, money } from "./ui";

type Table = { headers: string[]; rows: string[][] };

/* ---------- CSV ---------- */

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

/* ---------- Excel (.xlsx) — гадны сан ашиглахгүйгээр ---------- */

async function unzip(buf: ArrayBuffer): Promise<(name: string) => Promise<string | null>> {
  const dv = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not zip");
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const entries = new Map<string, { method: number; size: number; offset: number }>();
  const dec = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const size = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const offset = dv.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(buf, p + 46, nameLen));
    entries.set(name, { method, size, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return async (name: string) => {
    const e = entries.get(name);
    if (!e) return null;
    const start = e.offset + 30 + dv.getUint16(e.offset + 26, true) + dv.getUint16(e.offset + 28, true);
    const data = new Uint8Array(buf.slice(start, start + e.size));
    if (e.method === 0) return dec.decode(data);
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return dec.decode(await new Response(stream).arrayBuffer());
  };
}

const colIndex = (ref: string) => {
  const letters = ref.replace(/\d+/g, "");
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

async function parseXLSX(buf: ArrayBuffer): Promise<Table> {
  const get = await unzip(buf);
  const xml = (s: string) => new DOMParser().parseFromString(s, "application/xml");
  const strings: string[] = [];
  const ss = await get("xl/sharedStrings.xml");
  if (ss) {
    for (const si of Array.from(xml(ss).getElementsByTagName("si"))) {
      strings.push(Array.from(si.getElementsByTagName("t")).map((t) => t.textContent ?? "").join(""));
    }
  }
  // Эхний хуудсыг олно
  let sheetPath = "xl/worksheets/sheet1.xml";
  const wb = await get("xl/workbook.xml");
  const rels = await get("xl/_rels/workbook.xml.rels");
  if (wb && rels) {
    const first = xml(wb).getElementsByTagName("sheet")[0];
    const rid = first?.getAttribute("r:id");
    const rel = Array.from(xml(rels).getElementsByTagName("Relationship")).find((r) => r.getAttribute("Id") === rid);
    const target = rel?.getAttribute("Target");
    if (target) sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
  }
  const sheet = await get(sheetPath);
  if (!sheet) throw new Error("no sheet");
  const grid: string[][] = [];
  for (const r of Array.from(xml(sheet).getElementsByTagName("row"))) {
    const out: string[] = [];
    for (const c of Array.from(r.getElementsByTagName("c"))) {
      const ref = c.getAttribute("r");
      const idx = ref ? colIndex(ref) : out.length;
      const type = c.getAttribute("t");
      const v = c.getElementsByTagName("v")[0]?.textContent ?? "";
      let val = v;
      if (type === "s") val = strings[Number(v)] ?? "";
      else if (type === "inlineStr") val = Array.from(c.getElementsByTagName("t")).map((t) => t.textContent ?? "").join("");
      while (out.length < idx) out.push("");
      out[idx] = val;
    }
    if (out.some((x) => x.trim() !== "")) grid.push(out);
  }
  const headers = (grid.shift() ?? []).map((h) => h.trim());
  return { headers, rows: grid };
}

/* ---------- Тоо, огноо ---------- */

const toNumber = (s: string) => {
  const t = String(s).trim();
  if (!t) return NaN;
  const n = Number(t.replace(/[\s₮,]/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

// 2026-03-15, 2026/3/15, 15.03.2026, 15/03/2026, Excel-ийн огнооны тоо (46000 г.м.)
const toDate = (s: string): Date | null => {
  const t = s.trim();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  m = t.match(/^(\d{4})[-/.](\d{1,2})$/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, 1));
  const n = Number(t);
  if (Number.isFinite(n) && n > 20000 && n < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 864e5);
  return null;
};
const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const WD = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
const WD_ORDER = [1, 2, 3, 4, 5, 6, 0];

const guess = (headers: string[], words: string[], not: number[] = []) =>
  headers.findIndex((h, i) => !not.includes(i) && words.some((w) => h.toLowerCase().includes(w)));

/* ---------- Жишээ өгөгдөл (тогтмол, зохиомол) ---------- */

const SAMPLE_ITEMS = [
  { name: "Мах", price: 22000, margin: 0.28, w: 3 },
  { name: "Гурил", price: 52000, margin: 0.18, w: 2 },
  { name: "Сүү", price: 3800, margin: 0.22, w: 6 },
  { name: "Будаа", price: 21000, margin: 0.2, w: 2 },
  { name: "Ундаа", price: 2500, margin: 0.12, w: 7 },
  { name: "Чихэр", price: 6000, margin: 0.3, w: 3 },
  { name: "Ахуйн бараа", price: 9000, margin: 0.1, w: 1 },
];
function makeSample(): string {
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pool = SAMPLE_ITEMS.flatMap((it) => Array(it.w).fill(it) as (typeof it)[]);
  const lines = ["Огноо,Бараа,Тоо,Дүн,Өртөг"];
  const start = Date.UTC(2026, 0, 1);
  for (let day = 0; day < 181; day++) {
    const d = new Date(start + day * 864e5);
    const wd = d.getUTCDay();
    const n = 2 + Math.round(rnd() * 2) + (wd === 5 || wd === 6 ? 2 : 0) + (d.getUTCMonth() >= 4 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const it = pool[Math.floor(rnd() * pool.length)];
      const qty = 1 + Math.floor(rnd() * (it.price < 5000 ? 30 : 6));
      const sum = it.price * qty;
      lines.push([d.toISOString().slice(0, 10), it.name, qty, sum, Math.round(sum * (1 - it.margin))].join(","));
    }
  }
  return lines.join("\n");
}

/* ---------- Үндсэн хэсэг ---------- */

export default function DataUpload() {
  const [table, setTable] = useState<Table | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dateCol, setDateCol] = useState(-1);
  const [itemCol, setItemCol] = useState(-1);
  const [amountCol, setAmountCol] = useState(-1);
  const [qtyCol, setQtyCol] = useState(-1);
  const [costCol, setCostCol] = useState(-1);

  const use = (t: Table, name: string) => {
    if (t.headers.length < 2 || t.rows.length === 0) throw new Error("empty");
    setTable(t);
    setFileName(name);
    setError("");
    const d = guess(t.headers, ["огноо", "date", "өдөр", "күн", "дата", "сар"]);
    const it = guess(t.headers, ["бараа", "бүтээгдэхүүн", "нэр", "product", "item", "ангилал", "төрөл", "category", "тауар", "үйлчилгээ"], [d]);
    const c = guess(t.headers, ["өртөг", "cost", "зардал", "өзіндік"], [d, it]);
    const a = guess(t.headers, ["дүн", "amount", "total", "нийт", "орлого", "сома", "sum", "борлуулалт"], [d, it, c]);
    const q = guess(t.headers, ["тоо", "ширхэг", "qty", "quantity", "саны"], [d, it, c, a]);
    setDateCol(d);
    setItemCol(it);
    setCostCol(c);
    setQtyCol(q);
    setAmountCol(a >= 0 ? a : t.headers.length - 1);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      if (/\.xlsx$/i.test(f.name)) use(await parseXLSX(await f.arrayBuffer()), f.name);
      else if (/\.(csv|txt|tsv)$/i.test(f.name)) use(parseCSV(await f.text()), f.name);
      else throw new Error("type");
    } catch (e) {
      setTable(null);
      setError(
        e instanceof Error && e.message === "type"
          ? "Excel (.xlsx) эсвэл CSV файл оруулна уу. Хуучин .xls файлыг Excel дээр «Save As → .xlsx» гэж хадгалаарай."
          : "Файлыг уншиж чадсангүй. Эхний мөрөнд баганын нэр (Огноо, Бараа, Дүн г.м.) байх хэрэгтэй."
      );
    }
    setBusy(false);
  };

  const downloadSample = () => {
    const blob = new Blob(["﻿" + makeSample()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jishee-borluulalt.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const r = useMemo(() => {
    if (!table || amountCol < 0) return null;
    let total = 0, cost = 0, count = 0, qty = 0;
    const items = new Map<string, { rev: number; cost: number; qty: number }>();
    const months = new Map<string, number>();
    const monthDays = new Map<string, Set<string>>();
    const wd = new Map<number, { sum: number; days: Set<string> }>();
    for (const row of table.rows) {
      const v = toNumber(row[amountCol] ?? "");
      if (Number.isNaN(v)) continue;
      const c = costCol >= 0 ? toNumber(row[costCol] ?? "") : NaN;
      const q = qtyCol >= 0 ? toNumber(row[qtyCol] ?? "") : NaN;
      total += v; count++;
      if (!Number.isNaN(c)) cost += c;
      if (!Number.isNaN(q)) qty += q;
      if (itemCol >= 0) {
        const k = (row[itemCol] ?? "").trim() || "(хоосон)";
        const cur = items.get(k) ?? { rev: 0, cost: 0, qty: 0 };
        cur.rev += v;
        if (!Number.isNaN(c)) cur.cost += c;
        if (!Number.isNaN(q)) cur.qty += q;
        items.set(k, cur);
      }
      if (dateCol >= 0) {
        const d = toDate(row[dateCol] ?? "");
        if (d) {
          const mk = monthKey(d);
          months.set(mk, (months.get(mk) ?? 0) + v);
          const md = monthDays.get(mk) ?? new Set<string>();
          md.add(d.toISOString().slice(0, 10));
          monthDays.set(mk, md);
          const w = wd.get(d.getUTCDay()) ?? { sum: 0, days: new Set<string>() };
          w.sum += v;
          w.days.add(d.toISOString().slice(0, 10));
          wd.set(d.getUTCDay(), w);
        }
      }
    }
    const itemList = Array.from(items.entries())
      .map(([name, x]) => ({ name, ...x, profit: x.rev - x.cost }))
      .sort((a, b) => b.rev - a.rev);
    // ABC: орлогын 80%-ийг хэдэн бараа бүрдүүлж байна
    let acc = 0, abc = 0;
    for (const it of itemList) { acc += it.rev; abc++; if (acc >= total * 0.8) break; }
    const monthList = Array.from(months.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    // Сүүлийн сар дутуу эсэх (бусад сарын өдрийн тооны талаас бага бол)
    const dayCounts = monthList.map(([m]) => monthDays.get(m)?.size ?? 0);
    const others = dayCounts.slice(0, -1).sort((a, b) => a - b);
    const median = others.length ? others[Math.floor(others.length / 2)] : 0;
    const partial = monthList.length >= 2 && dayCounts[dayCounts.length - 1] > 0 && dayCounts[dayCounts.length - 1] < median * 0.5 ? monthList[monthList.length - 1][0] : null;
    const full = partial ? monthList.slice(0, -1) : monthList;
    // Шугаман таамаг (бүтэн 3+ сар байвал)
    let forecast: number | null = null;
    if (full.length >= 3) {
      const ys = full.map((m) => m[1]);
      const n = ys.length, mx = (n - 1) / 2, my = ys.reduce((a, b) => a + b, 0) / n;
      const slope = ys.reduce((s, y, i) => s + (i - mx) * (y - my), 0) / ys.reduce((s, _, i) => s + (i - mx) ** 2, 0);
      forecast = Math.max(0, my + slope * (n - mx));
    }
    const growth = full.length >= 2 ? (full[full.length - 1][1] / full[full.length - 2][1] - 1) * 100 : null;
    const weekdays = WD_ORDER.map((d) => {
      const w = wd.get(d);
      return { d: WD[d], v: w ? w.sum / w.days.size : 0 };
    });
    return { total, cost, count, qty, itemList, abc, monthList, partial, forecast, growth, weekdays, hasCost: costCol >= 0 && cost > 0 };
  }, [table, amountCol, itemCol, dateCol, qtyCol, costCol]);

  const insights: string[] = [];
  if (r) {
    const top = r.itemList[0];
    if (top) insights.push(`«${top.name}» нийт орлогын ${Math.round((top.rev / r.total) * 100)}%-ийг бүрдүүлж байна.`);
    if (r.itemList.length >= 4) insights.push(`Орлогын 80%-ийг ${r.itemList.length} нэр төрлийн ${r.abc} нь бүрдүүлж байна — эдгээрийг хэзээ ч дуусгаж болохгүй.`);
    if (r.hasCost && r.itemList.length >= 2) {
      const byMargin = [...r.itemList].filter((x) => x.rev > 0).sort((a, b) => a.profit / a.rev - b.profit / b.rev);
      const low = byMargin[0];
      insights.push(`Ашгийн хувь хамгийн бага нь «${low.name}» (${Math.round((low.profit / low.rev) * 100)}%) — үнэ эсвэл нийлүүлэгчээ эргэж хараарай.`);
    }
    const days = r.weekdays.filter((w) => w.v > 0);
    if (days.length >= 5) {
      const hi = days.reduce((a, b) => (b.v > a.v ? b : a));
      const lo = days.reduce((a, b) => (b.v < a.v ? b : a));
      insights.push(`Хамгийн ачаалалтай нь ${hi.d} гараг — ${lo.d} гарагаас ${Math.round((hi.v / lo.v - 1) * 100)}% илүү борлуулалттай.`);
    }
    if (r.partial) insights.push(`${r.partial} сарын өгөгдөл дутуу тул өсөлт, таамагт оруулаагүй.`);
    if (r.growth !== null) insights.push(`Сүүлийн бүтэн сард өмнөх сараас ${Math.abs(Math.round(r.growth))}% ${r.growth >= 0 ? "өссөн" : "буурсан"}.`);
    if (r.forecast !== null) insights.push(`Одоогийн хандлагаар ирэх сард ойролцоогоор ${money(r.forecast)} орлого хүлээгдэж байна (энгийн таамаг).`);
  }

  const printReport = () => {
    if (!r) return;
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
    const rows = r.itemList.slice(0, 15).map((it) => `<tr><td>${esc(it.name)}</td><td>${money(it.rev)}</td><td>${Math.round((it.rev / r.total) * 100)}%</td>${r.hasCost ? `<td>${money(it.profit)}</td>` : ""}</tr>`).join("");
    const mrows = r.monthList.map(([m, v]) => `<tr><td>${m}</td><td>${money(v)}</td></tr>`).join("");
    const html = `<!doctype html><html lang="mn"><head><meta charset="utf-8"><title>Борлуулалтын тайлан — ${esc(fileName)}</title>
<style>body{font-family:system-ui,Arial,sans-serif;color:#0f172a;margin:32px;max-width:800px}h1{font-size:22px;margin:0}h2{font-size:16px;margin-top:28px}
.k{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.k div{border:1px solid #cbd5e1;border-radius:8px;padding:10px}.k b{display:block;font-size:18px}
table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}td,th{border-bottom:1px solid #e2e8f0;padding:6px;text-align:left}li{margin:6px 0}small{color:#64748b}</style></head><body>
<h1>Борлуулалтын товч тайлан</h1><small>Файл: ${esc(fileName)} · ${r.count} гүйлгээ · TengerNextLab-ийн жишээ шинжилгээ</small>
<div class="k"><div>Нийт орлого<b>${money(r.total)}</b></div><div>Гүйлгээ<b>${r.count}</b></div><div>Дундаж<b>${money(r.total / Math.max(1, r.count))}</b></div>${r.hasCost ? `<div>Ашиг<b>${money(r.total - r.cost)}</b></div>` : `<div>Нэр төрөл<b>${r.itemList.length}</b></div>`}</div>
<h2>Гол дүгнэлт</h2><ul>${insights.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
<h2>Бараа / ангилал</h2><table><tr><th>Нэр</th><th>Орлого</th><th>Хувь</th>${r.hasCost ? "<th>Ашиг</th>" : ""}</tr>${rows}</table>
${mrows ? `<h2>Сар бүрээр</h2><table><tr><th>Сар</th><th>Орлого</th></tr>${mrows}</table>` : ""}
<script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  const sel = (label: string, value: number, set: (n: number) => void, optional = true) => (
    <label className="text-xs text-slate-400">
      {label}
      <select value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-white/10 bg-sky-deep px-2 py-1.5 text-sm text-white">
        {optional && <option value={-1}>— байхгүй —</option>}
        {table?.headers.map((h, i) => <option key={i} value={i}>{h || `Багана ${i + 1}`}</option>)}
      </select>
    </label>
  );

  const topItems = r?.itemList.slice(0, 7) ?? [];
  const maxItem = Math.max(1, ...topItems.map((x) => x.rev));
  const bars = r ? [...r.monthList.map(([m, v]) => ({ m, v, f: false, p: m === r.partial })), ...(r.forecast !== null ? [{ m: "таамаг", v: r.forecast, f: true, p: false }] : [])] : [];
  const maxMonth = Math.max(1, ...bars.map((x) => x.v));
  const maxDay = Math.max(1, ...(r?.weekdays.map((w) => w.v) ?? [1]));
  const best = r?.monthList.length ? r.monthList.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
  const short = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} сая` : n >= 1e3 ? `${Math.round(n / 1e3)}к` : `${Math.round(n)}`);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">Өөрийн файлаар туршаад үзээрэй</p>
          <p className="mt-1 text-sm text-slate-300">Борлуулалтынхаа Excel (.xlsx) эсвэл CSV файлыг оруулбал хэдхэн секундэд дүн, ашиг, шилдэг бараа, гарагийн ачаалал, ирэх сарын таамгийг гаргана.</p>
          <p className="mt-1 text-xs text-emerald-300">🔒 Файл таны компьютерээс гарахгүй — зөвхөн энэ хуудас дотор боловсруулагдана.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <label className={`${btnMain} cursor-pointer`}>
            📂 {busy ? "Уншиж байна…" : "Файл сонгох"}
            <input type="file" accept=".xlsx,.csv,.txt,.tsv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <button className={btnGhost} onClick={() => { try { use(parseCSV(makeSample()), "jishee-borluulalt.csv"); } catch { /* жишээ үргэлж зөв */ } }}>Жишээгээр турших</button>
          <button className={btnGhost} onClick={downloadSample}>⬇ Жишээ файл</button>
        </div>
      </div>

      {!table && !error && (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-xs text-slate-400">
          Файлын эхний мөрөнд баганын нэр байхад хангалттай. Жишээ нь: <span className="text-slate-200">Огноо · Бараа · Тоо · Дүн · Өртөг</span>. «Өртөг» багана байвал ашгийг ч тооцоолно.
        </div>
      )}

      {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

      {table && r && (
        <div className="mt-5 space-y-3">
          <Panel title={`📄 ${fileName} · ${table.rows.length} мөр`} right={<button className={btnGhost} onClick={printReport}>🖨 Тайлан хэвлэх / PDF</button>}>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {sel("Огноо", dateCol, setDateCol)}
              {sel("Бараа / ангилал", itemCol, setItemCol)}
              {sel("Дүн (орлого)", amountCol, setAmountCol, false)}
              {sel("Тоо ширхэг", qtyCol, setQtyCol)}
              {sel("Өртөг", costCol, setCostCol)}
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Нийт орлого" value={money(r.total)} />
            {r.hasCost ? <Stat label="Ашиг (ашгийн хувь)" value={`${money(r.total - r.cost)} · ${Math.round(((r.total - r.cost) / r.total) * 100)}%`} /> : <Stat label="Гүйлгээ" value={r.count} />}
            <Stat label="Дундаж гүйлгээ" value={money(r.count ? r.total / r.count : 0)} />
            <Stat label="Хамгийн сайн сар" value={best ? best[0] : "—"} />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Panel title="Шилдэг бараа / ангилал">
              {topItems.length === 0 ? (
                <p className="text-sm text-slate-500">«Бараа / ангилал» багана сонгоно уу.</p>
              ) : (
                <ul className="space-y-3">
                  {topItems.map((it) => (
                    <li key={it.name}>
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="truncate text-slate-300">{it.name}</span>
                        <span className="shrink-0 font-medium text-white">
                          {money(it.rev)} <span className="font-normal text-slate-500">· {Math.round((it.rev / r.total) * 100)}%</span>
                          {r.hasCost && <span className="font-normal text-emerald-300"> · ашиг {Math.round((it.profit / Math.max(1, it.rev)) * 100)}%</span>}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/5">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${(it.rev / maxItem) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Сар бүрийн орлого ба таамаг">
              {bars.length === 0 ? (
                <p className="text-sm text-slate-500">«Огноо» багана сонгоно уу.</p>
              ) : (
                <>
                  <div className="flex h-44 items-end gap-1.5 border-b border-white/15">
                    {bars.map((b) => (
                      <div key={b.m} className="flex h-full flex-1 flex-col items-center justify-end" title={`${b.m}: ${money(b.v)}`}>
                        <span className="mb-1 text-[9px] text-slate-400">{short(b.v)}</span>
                        <div
                          className={`w-full rounded-t ${b.f ? "border-2 border-dashed border-accent bg-accent/10" : b.p ? "bg-accent/35" : "bg-accent"}`}
                          style={{ height: `${(b.v / maxMonth) * 82}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-1.5 text-center text-[10px] text-slate-500">
                    {bars.map((b) => <span key={b.m} className={`flex-1 truncate ${b.f ? "text-accent" : ""}`}>{b.f ? "таамаг" : b.p ? `${b.m.slice(2)}*` : b.m.slice(2)}</span>)}
                  </div>
                  {r.partial && <p className="mt-2 text-[11px] text-slate-500">* {r.partial} — дутуу сар (таамагт оруулаагүй)</p>}
                </>
              )}
            </Panel>

            <Panel title="Гарагийн дундаж борлуулалт (өдөрт)">
              {r.weekdays.every((w) => w.v === 0) ? (
                <p className="text-sm text-slate-500">Өдрийн огноотой файл оруулбал гарагийн ачааллыг харуулна.</p>
              ) : (
                <>
                  <div className="flex h-36 items-end gap-2 border-b border-white/15">
                    {r.weekdays.map((w) => (
                      <div key={w.d} className="flex h-full flex-1 flex-col items-center justify-end" title={`${w.d}: ${money(w.v)}`}>
                        <div className={`w-full rounded-t ${w.v === maxDay ? "bg-accent" : "bg-accent/45"}`} style={{ height: `${(w.v / maxDay) * 100}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-2 text-center text-[10px] text-slate-500">
                    {r.weekdays.map((w) => <span key={w.d} className="flex-1">{w.d}</span>)}
                  </div>
                </>
              )}
            </Panel>

            <Panel title="💡 Автомат дүгнэлт">
              <ol className="space-y-2">
                {insights.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-slate-500">Бүрэн шинжилгээнд зардал, улирлын хэлбэлзэл, харилцагчийн давталт, нарийн таамаглалыг нэмж, утсаар харах самбар болгож өгнө.</p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
