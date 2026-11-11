"use client";

// Үйлчилгээ бүрийн дарж туршдаг жишээ. Бүх нэр, тоо зохиомол.

import { useState } from "react";

/* ---------- Нийтлэг жижиг хэсгүүд ---------- */

function Frame({ label, sub, right, children }: { label: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }) {
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

function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
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

type Tone = "good" | "warn" | "bad" | "info";
const toneCls: Record<Tone, string> = {
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  bad: "border-red-400/30 bg-red-400/10 text-red-300",
  info: "border-white/15 bg-white/5 text-slate-300",
};
const toneIcon: Record<Tone, string> = { good: "✓", warn: "!", bad: "✕", info: "•" };

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneCls[tone]}`}>
      <span aria-hidden>{toneIcon[tone]}</span>
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

const btn = "rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
const btnMain = `${btn} bg-accent text-sky-deep hover:bg-sky-300`;
const btnGhost = `${btn} border border-white/15 text-slate-200 hover:bg-white/5`;

/* ---------- 1. Цаг бүртгэл ---------- */

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const START = "09:00";
const END = "18:00";
const NOW_IN = "09:21"; // жишээн дэх «одоо» цаг
const NOW_OUT = "18:10";

type Emp = { name: string; role: string; in: string | null; out: string | null };

export function AttendanceDemo() {
  const [tab, setTab] = useState<"today" | "month">("today");
  const [emps, setEmps] = useState<Emp[]>([
    { name: "Б. Болд", role: "Кассчин", in: "08:52", out: null },
    { name: "Г. Сараа", role: "Нягтлан", in: "09:14", out: null },
    { name: "А. Ерлан", role: "Жолооч", in: "08:45", out: null },
    { name: "Т. Айгерим", role: "Борлуулагч", in: null, out: null },
    { name: "Д. Тэмүүлэн", role: "Нярав", in: "09:03", out: null },
  ]);

  const mark = (i: number, kind: "in" | "out") =>
    setEmps((list) => list.map((e, j) => (j === i ? { ...e, [kind]: kind === "in" ? NOW_IN : NOW_OUT } : e)));

  const present = emps.filter((e) => e.in).length;
  const late = emps.filter((e) => e.in && toMin(e.in) > toMin(START)).length;

  const month = [
    { name: "Б. Болд", days: 22, lateMin: 0, ot: 6, absent: 0 },
    { name: "Г. Сараа", days: 21, lateMin: 47, ot: 0, absent: 1 },
    { name: "А. Ерлан", days: 22, lateMin: 0, ot: 14, absent: 0 },
    { name: "Т. Айгерим", days: 19, lateMin: 85, ot: 2, absent: 3 },
    { name: "Д. Тэмүүлэн", days: 22, lateMin: 12, ot: 4, absent: 0 },
  ];

  return (
    <Frame
      label="Жишээ · дарж туршаарай"
      sub={`Ажлын цаг ${START}–${END} · Жишээнд «Ирлээ» = ${NOW_IN}, «Явлаа» = ${NOW_OUT}`}
      right={<Tabs label="Харах" value={tab} onChange={setTab} options={[{ v: "today", label: "Өнөөдөр" }, { v: "month", label: "Сарын тайлан" }]} />}
    >
      {tab === "today" ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Ирсэн" value={`${present}/${emps.length}`} />
            <Stat label="Хоцорсон" value={late} />
            <Stat label="Ирээгүй" value={emps.length - present} />
          </div>
          <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-white/10 bg-sky-deep/60">
            {emps.map((e, i) => {
              const lateBy = e.in ? toMin(e.in) - toMin(START) : 0;
              const ot = e.out ? toMin(e.out) - toMin(END) : 0;
              return (
                <li key={e.name} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    {e.name.split(" ")[1][0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{e.name}</p>
                    <p className="text-xs text-slate-400">{e.role}</p>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    <p>Ирсэн: <span className="font-medium text-white">{e.in ?? "—"}</span></p>
                    <p>Явсан: <span className="font-medium text-white">{e.out ?? "—"}</span></p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                    {!e.in ? (
                      <Badge tone="bad">Ирээгүй</Badge>
                    ) : lateBy > 0 ? (
                      <Badge tone="warn">{lateBy} мин хоцорсон</Badge>
                    ) : (
                      <Badge tone="good">Цагтаа</Badge>
                    )}
                    {ot > 0 && <Badge tone="info">+{ot} мин илүү</Badge>}
                    {!e.in ? (
                      <button className={btnMain} onClick={() => mark(i, "in")}>Ирлээ</button>
                    ) : !e.out ? (
                      <button className={btnGhost} onClick={() => mark(i, "out")}>Явлаа</button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-sky-deep/60">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs text-slate-400">
              <tr className="border-b border-white/10">
                <th className="p-3 font-medium">Ажилтан</th>
                <th className="p-3 text-right font-medium">Ажилласан өдөр</th>
                <th className="p-3 text-right font-medium">Хоцролт</th>
                <th className="p-3 text-right font-medium">Илүү цаг</th>
                <th className="p-3 text-right font-medium">Тасалсан</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {month.map((m) => (
                <tr key={m.name}>
                  <td className="p-3 font-medium text-white">{m.name}</td>
                  <td className="p-3 text-right">{m.days}/22</td>
                  <td className={`p-3 text-right ${m.lateMin > 60 ? "text-amber-300" : ""}`}>{m.lateMin} мин</td>
                  <td className="p-3 text-right">{m.ot} цаг</td>
                  <td className={`p-3 text-right ${m.absent > 1 ? "text-red-300" : ""}`}>{m.absent} өдөр</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/10 p-3 text-xs text-slate-500">Энэ хүснэгтийг сарын эцэст Excel-ээр татаж, цалин бодоход шууд ашиглана.</p>
        </div>
      )}
    </Frame>
  );
}

/* ---------- 2. Агуулах ---------- */

type Item = { name: string; unit: string; qty: number; min: number };
type Move = { item: string; delta: number; t: string };

export function WarehouseDemo() {
  const [items, setItems] = useState<Item[]>([
    { name: "Гурил 25 кг", unit: "шуудай", qty: 42, min: 15 },
    { name: "Будаа 5 кг", unit: "уут", qty: 8, min: 10 },
    { name: "Ургамлын тос 5 л", unit: "лонх", qty: 0, min: 6 },
    { name: "Элсэн чихэр 1 кг", unit: "ш", qty: 120, min: 40 },
    { name: "Шахмал цай", unit: "ш", qty: 14, min: 12 },
    { name: "Угаалгын нунтаг", unit: "хайрцаг", qty: 5, min: 8 },
  ]);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [q, setQ] = useState("");
  const [log, setLog] = useState<Move[]>([
    { item: "Элсэн чихэр 1 кг", delta: 60, t: "10:05" },
    { item: "Гурил 25 кг", delta: -3, t: "09:40" },
  ]);
  const [clock, setClock] = useState(10 * 60 + 12);

  const status = (it: Item): Tone => (it.qty === 0 ? "bad" : it.qty <= it.min ? "warn" : "good");
  const statusText = { good: "Хангалттай", warn: "Дуусах дөхсөн", bad: "Дууссан", info: "" };

  const change = (name: string, delta: number) => {
    setItems((list) => list.map((it) => (it.name === name ? { ...it, qty: Math.max(0, it.qty + delta) } : it)));
    const t = `${String(Math.floor(clock / 60)).padStart(2, "0")}:${String(clock % 60).padStart(2, "0")}`;
    setClock((c) => c + 3);
    setLog((l) => [{ item: name, delta, t }, ...l].slice(0, 5));
  };

  const shown = items.filter(
    (it) =>
      it.name.toLowerCase().includes(q.toLowerCase()) &&
      (filter === "all" || (filter === "low" && status(it) === "warn") || (filter === "out" && status(it) === "bad"))
  );

  return (
    <Frame
      label="Жишээ · дарж туршаарай"
      sub="Жишээ: хүнсний бөөний агуулах"
      right={
        <Tabs
          label="Шүүлтүүр"
          value={filter}
          onChange={setFilter}
          options={[
            { v: "all", label: "Бүгд" },
            { v: "low", label: "Дуусах дөхсөн" },
            { v: "out", label: "Дууссан" },
          ]}
        />
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Нэр төрөл" value={items.length} />
        <Stat label="Дуусах дөхсөн" value={items.filter((i) => status(i) === "warn").length} />
        <Stat label="Дууссан" value={items.filter((i) => status(i) === "bad").length} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-sky-deep/60 lg:col-span-2">
          <div className="border-b border-white/10 p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Бараа хайх…"
              aria-label="Бараа хайх"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
            />
          </div>
          <ul className="divide-y divide-white/5">
            {shown.map((it) => {
              const s = status(it);
              return (
                <li key={it.name} className="flex flex-wrap items-center gap-3 p-3">
                  <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                    <p className="text-sm font-medium text-white">{it.name}</p>
                    <p className="text-xs text-slate-500">Доод хэмжээ: {it.min} {it.unit}</p>
                  </div>
                  <Badge tone={s}>{statusText[s]}</Badge>
                  <div className="ml-auto flex items-center gap-2 sm:ml-0">
                    <button aria-label={`${it.name} зарлага`} className={`${btnGhost} h-8 w-8 px-0`} disabled={it.qty === 0} onClick={() => change(it.name, -1)}>−</button>
                    <span className="w-20 text-center text-sm font-semibold text-white">
                      {it.qty} <span className="text-xs font-normal text-slate-400">{it.unit}</span>
                    </span>
                    <button aria-label={`${it.name} орлого`} className={`${btnMain} h-8 w-8 px-0`} onClick={() => change(it.name, 5)}>+</button>
                  </div>
                </li>
              );
            })}
            {shown.length === 0 && <li className="p-6 text-center text-sm text-slate-500">Ийм бараа алга.</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
          <h3 className="text-sm font-semibold text-white">Сүүлийн хөдөлгөөн</h3>
          <ul className="mt-3 space-y-3">
            {log.map((m, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="text-slate-200">{m.item}</p>
                  <p className="text-xs text-slate-500">{m.delta > 0 ? "Орлого" : "Зарлага"} · {m.t}</p>
                </div>
                <span className={`font-semibold ${m.delta > 0 ? "text-emerald-300" : "text-slate-300"}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">«+» нь 5 нэгж орлого, «−» нь 1 нэгж зарлага. Доод хэмжээнээс доош ормогц төлөв өөрчлөгдөнө.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 3. Хүний нөөц ---------- */

type Person = { id: number; name: string; dept: string; pos: string; since: string; phone: string; contractDays: number; leaveLeft: number };
type Req = { id: number; pid: number; type: string; dates: string; days: number; status: "pending" | "ok" | "no" };

export function HRDemo() {
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Б. Болд", dept: "Борлуулалт", pos: "Кассчин", since: "2022.03", phone: "9911 ****", contractDays: 210, leaveLeft: 9 },
    { id: 2, name: "Г. Сараа", dept: "Санхүү", pos: "Нягтлан бодогч", since: "2020.09", phone: "8811 ****", contractDays: 38, leaveLeft: 15 },
    { id: 3, name: "А. Ерлан", dept: "Тээвэр", pos: "Жолооч", since: "2023.05", phone: "9515 ****", contractDays: 320, leaveLeft: 6 },
    { id: 4, name: "Т. Айгерим", dept: "Борлуулалт", pos: "Борлуулагч", since: "2024.01", phone: "8080 ****", contractDays: 12, leaveLeft: 11 },
    { id: 5, name: "Д. Тэмүүлэн", dept: "Агуулах", pos: "Нярав", since: "2021.11", phone: "9909 ****", contractDays: 150, leaveLeft: 4 },
  ]);
  const [reqs, setReqs] = useState<Req[]>([
    { id: 1, pid: 1, type: "Ээлжийн амралт", dates: "12.02–12.06", days: 5, status: "pending" },
    { id: 2, pid: 5, type: "Чөлөө", dates: "11.20", days: 1, status: "pending" },
    { id: 3, pid: 3, type: "Ээлжийн амралт", dates: "12.15–12.18", days: 4, status: "pending" },
  ]);
  const [dept, setDept] = useState("Бүгд");
  const [sel, setSel] = useState(2);
  const depts = ["Бүгд", ...Array.from(new Set(people.map((p) => p.dept)))];
  const p = people.find((x) => x.id === sel)!;

  const decide = (r: Req, ok: boolean) => {
    setReqs((l) => l.map((x) => (x.id === r.id ? { ...x, status: ok ? "ok" : "no" } : x)));
    if (ok) setPeople((l) => l.map((x) => (x.id === r.pid ? { ...x, leaveLeft: Math.max(0, x.leaveLeft - r.days) } : x)));
  };

  return (
    <Frame label="Жишээ · дарж туршаарай" sub="Жишээ: 5 ажилтантай компани">
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Жагсаалт */}
        <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-3 lg:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {depts.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                aria-pressed={dept === d}
                className={`rounded-full px-2.5 py-1 text-[11px] transition ${dept === d ? "bg-accent text-sky-deep" : "border border-white/10 text-slate-300 hover:text-white"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <ul className="mt-3 space-y-1">
            {people
              .filter((x) => dept === "Бүгд" || x.dept === dept)
              .map((x) => (
                <li key={x.id}>
                  <button
                    onClick={() => setSel(x.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${sel === x.id ? "bg-accent/10 ring-1 ring-accent/40" : "hover:bg-white/5"}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{x.name.split(" ")[1][0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white">{x.name}</span>
                      <span className="block text-xs text-slate-400">{x.pos}</span>
                    </span>
                    {x.contractDays <= 60 && <span className="h-2 w-2 rounded-full bg-amber-400" aria-label="Гэрээ дуусах дөхсөн" />}
                  </button>
                </li>
              ))}
          </ul>
        </div>

        {/* Хувийн хэрэг */}
        <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-5 lg:col-span-3">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-xl font-semibold text-accent">{p.name.split(" ")[1][0]}</span>
            <div>
              <p className="text-lg font-semibold text-white">{p.name}</p>
              <p className="text-sm text-slate-400">{p.pos} · {p.dept}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Ажилд орсон</dt><dd className="mt-0.5 font-medium text-white">{p.since}</dd></div>
            <div className="rounded-xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Утас</dt><dd className="mt-0.5 font-medium text-white">{p.phone}</dd></div>
            <div className="rounded-xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Амралтын үлдэгдэл</dt><dd className="mt-0.5 font-medium text-white">{p.leaveLeft} хоног</dd></div>
            <div className="rounded-xl bg-white/5 p-3">
              <dt className="text-xs text-slate-400">Гэрээ дуусахад</dt>
              <dd className="mt-1">{p.contractDays <= 60 ? <Badge tone="warn">{p.contractDays} хоног</Badge> : <Badge tone="good">{p.contractDays} хоног</Badge>}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            {["Анкет", "Хөдөлмөрийн гэрээ", "Томилгооны тушаал", "Үнэлгээ 2025"].map((d) => (
              <span key={d} className="rounded-lg border border-white/10 px-2.5 py-1">📄 {d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Хүсэлтүүд */}
      <div className="mt-3 rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
        <h3 className="text-sm font-semibold text-white">Чөлөө, амралтын хүсэлт</h3>
        <ul className="mt-3 divide-y divide-white/5">
          {reqs.map((r) => {
            const who = people.find((x) => x.id === r.pid)!;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                  <p className="text-sm text-white">{who.name} · {r.type}</p>
                  <p className="text-xs text-slate-500">{r.dates} · {r.days} хоног · үлдэгдэл {who.leaveLeft} хоног</p>
                </div>
                {r.status === "pending" ? (
                  <div className="ml-auto flex gap-2 sm:ml-0">
                    <button className={btnGhost} onClick={() => decide(r, false)}>Татгалзах</button>
                    <button className={btnMain} onClick={() => decide(r, true)}>Зөвшөөрөх</button>
                  </div>
                ) : r.status === "ok" ? (
                  <Badge tone="good">Зөвшөөрсөн</Badge>
                ) : (
                  <Badge tone="bad">Татгалзсан</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Frame>
  );
}

/* ---------- 4. Вэб сайт ---------- */

const L = {
  mn: { nav: ["Нүүр", "Цэс", "Холбоо барих"], hi: "Тавтай морилно уу", sub: "Өлгий хотын төвд байрлах гэр бүлийн кафе", book: "Ширээ захиалах", menu: "Цэс", contact: "Холбоо барих", addr: "Өлгий хот, 5-р баг", hours: "Өдөр бүр 09:00–22:00", items: ["Лагман", "Бэшбармак", "Сүүтэй цай"] },
  kz: { nav: ["Басты", "Мәзір", "Байланыс"], hi: "Қош келдіңіз", sub: "Өлгий қаласының орталығындағы отбасылық кафе", book: "Үстел брондау", menu: "Мәзір", contact: "Байланыс", addr: "Өлгий қаласы, 5-баг", hours: "Күн сайын 09:00–22:00", items: ["Лағман", "Бешбармақ", "Сүтті шай"] },
  en: { nav: ["Home", "Menu", "Contact"], hi: "Welcome", sub: "A family café in the centre of Ölgii", book: "Book a table", menu: "Menu", contact: "Contact", addr: "Ölgii, 5th bag", hours: "Daily 09:00–22:00", items: ["Lagman", "Beshbarmak", "Milk tea"] },
};
const prices = ["12,000₮", "18,000₮", "3,000₮"];
const themes = [
  { name: "Шар", c: "#f59e0b" },
  { name: "Ногоон", c: "#10b981" },
  { name: "Ягаан", c: "#ec4899" },
  { name: "Цэнхэр", c: "#38bdf8" },
];

export function WebsiteDemo() {
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone");
  const [lang, setLang] = useState<"mn" | "kz" | "en">("mn");
  const [color, setColor] = useState(themes[0].c);
  const [booked, setBooked] = useState(false);
  const t = L[lang];
  const width = device === "phone" ? 320 : device === "tablet" ? 560 : 900;
  const wide = device !== "phone";

  return (
    <Frame
      label="Жишээ · дарж туршаарай"
      sub="Нэг сайт утас, таблет, компьютерт өөрөө тохирно"
      right={
        <Tabs
          label="Дэлгэц"
          value={device}
          onChange={setDevice}
          options={[
            { v: "phone", label: "Утас" },
            { v: "tablet", label: "Таблет" },
            { v: "desktop", label: "Компьютер" },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs label="Хэл" value={lang} onChange={setLang} options={[{ v: "mn", label: "Монгол" }, { v: "kz", label: "Қазақ" }, { v: "en", label: "English" }]} />
        <div className="flex items-center gap-2" role="group" aria-label="Өнгө">
          <span className="text-xs text-slate-400">Өнгө:</span>
          {themes.map((th) => (
            <button
              key={th.c}
              aria-label={th.name}
              aria-pressed={color === th.c}
              onClick={() => setColor(th.c)}
              className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-sky-deep transition ${color === th.c ? "ring-2 ring-white" : ""}`}
              style={{ background: th.c }}
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
        <div className="mx-auto overflow-hidden rounded-2xl border-4 border-slate-700 bg-white text-slate-800 shadow-xl transition-all duration-500" style={{ width, maxWidth: "100%" }}>
          {/* браузерын мөр */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="ml-2 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-500">jishee-cafe.mn</span>
          </div>
          {/* толгой */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-bold" style={{ color }}>☕ Жишээ кафе</span>
            {wide ? (
              <span className="flex gap-4 text-xs text-slate-600">{t.nav.map((n) => <span key={n}>{n}</span>)}</span>
            ) : (
              <span className="text-lg text-slate-500" aria-hidden>☰</span>
            )}
          </div>
          {/* hero */}
          <div className={`px-5 py-8 ${wide ? "text-left" : "text-center"}`} style={{ background: `${color}22` }}>
            <p className={`font-bold ${wide ? "text-3xl" : "text-2xl"}`}>{t.hi}</p>
            <p className="mt-2 text-sm text-slate-600">{t.sub}</p>
            <button onClick={() => setBooked(true)} className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: color }}>
              {booked ? "✓" : t.book}
            </button>
          </div>
          {/* цэс */}
          <div className="px-5 py-6">
            <p className="text-sm font-semibold">{t.menu}</p>
            <div className={`mt-3 grid gap-3 ${device === "desktop" ? "grid-cols-3" : device === "tablet" ? "grid-cols-2" : "grid-cols-1"}`}>
              {t.items.map((it, i) => (
                <div key={it} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base" style={{ background: `${color}33` }}>{["🍜", "🍲", "🍵"][i]}</span>
                    {it}
                  </span>
                  <span className="text-sm font-semibold" style={{ color }}>{prices[i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* холбоо */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{t.contact}</p>
            <p className="mt-1">📍 {t.addr} · 🕘 {t.hours}</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 5. Гар утасны апп ---------- */

const washes = [
  { name: "Гадна угаалга", price: 15000, min: 30, icon: "🚿" },
  { name: "Бүтэн угаалга", price: 35000, min: 60, icon: "✨" },
  { name: "Дотор цэвэрлэгээ", price: 25000, min: 45, icon: "🧽" },
];
const slots = [
  { t: "10:00", free: true },
  { t: "11:30", free: false },
  { t: "13:00", free: true },
  { t: "14:30", free: true },
  { t: "16:00", free: false },
  { t: "17:30", free: true },
];
const money = (n: number) => `${n.toLocaleString("en-US")}₮`;

export function MobileAppDemo() {
  const [screen, setScreen] = useState<0 | 1 | 2>(0);
  const [svc, setSvc] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [points, setPoints] = useState(120);
  const earned = Math.round(washes[svc].price / 1000);

  const confirm = () => {
    setPoints((p) => p + earned);
    setScreen(2);
  };
  const reset = () => {
    setScreen(0);
    setSlot(null);
  };

  const stepsText = ["Үйлчилгээ сонгох", "Сул цаг сонгох", "Баталгаажуулалт ба оноо"];

  return (
    <Frame label="Жишээ · дарж туршаарай" sub="Жишээ: «Жишээ угаалга» машин угаалгын апп">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        {/* Утас */}
        <div className="mx-auto w-[280px] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-900 shadow-2xl">
          <div className="mx-auto mt-2 h-4 w-24 rounded-full bg-slate-800" />
          <div className="relative h-[520px] overflow-hidden rounded-[1.8rem] bg-slate-50 text-slate-800">
            {screen === 0 && (
              <div className="p-4">
                <p className="text-xs text-slate-500">Сайн байна уу,</p>
                <p className="text-lg font-bold">Болд 👋</p>
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-white">
                  <p className="text-xs opacity-80">Таны бонус оноо</p>
                  <p className="text-2xl font-bold">{points}</p>
                  <p className="mt-1 text-[11px] opacity-80">200 оноо = 1 үнэгүй гадна угаалга</p>
                </div>
                <p className="mt-4 text-sm font-semibold">Үйлчилгээ</p>
                <div className="mt-2 space-y-2">
                  {washes.map((w, i) => (
                    <button
                      key={w.name}
                      onClick={() => {
                        setSvc(i);
                        setScreen(1);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-sky-400"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-lg">{w.icon}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{w.name}</span>
                        <span className="block text-xs text-slate-500">{w.min} мин</span>
                      </span>
                      <span className="text-sm font-semibold text-sky-600">{money(w.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {screen === 1 && (
              <div className="flex h-full flex-col p-4">
                <button onClick={() => setScreen(0)} className="self-start text-sm text-sky-600">← Буцах</button>
                <p className="mt-3 text-lg font-bold">{washes[svc].name}</p>
                <p className="text-xs text-slate-500">{washes[svc].min} мин · {money(washes[svc].price)}</p>
                <p className="mt-5 text-sm font-semibold">Өнөөдрийн сул цаг</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.t}
                      disabled={!s.free}
                      onClick={() => setSlot(s.t)}
                      className={`rounded-xl py-2 text-sm font-medium transition ${
                        !s.free ? "bg-slate-100 text-slate-300 line-through" : slot === s.t ? "bg-sky-500 text-white" : "bg-white ring-1 ring-slate-200 hover:ring-sky-400"
                      }`}
                    >
                      {s.t}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Зураастай цаг захиалагдсан.</p>
                <div className="mt-auto">
                  <button
                    disabled={!slot}
                    onClick={confirm}
                    className="w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white transition disabled:bg-slate-300"
                  >
                    {slot ? `${slot}-д захиалах` : "Цаг сонгоно уу"}
                  </button>
                </div>
              </div>
            )}

            {screen === 2 && (
              <div className="flex h-full flex-col p-4">
                <div className="rounded-2xl bg-slate-800 p-3 text-xs text-white shadow-lg">
                  🔔 <b>Жишээ угаалга</b>
                  <br />
                  Таны ээлж {slot}-д. 15 минутын өмнө сануулна.
                </div>
                <div className="mt-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
                  <p className="mt-4 text-lg font-bold">Захиалга баталгаажлаа</p>
                  <p className="mt-1 text-sm text-slate-500">{washes[svc].name} · өнөөдөр {slot}</p>
                  <p className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">+{earned} бонус оноо</p>
                </div>
                <button onClick={reset} className="mt-auto w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white">Нүүр хуудас</button>
              </div>
            )}
          </div>
        </div>

        {/* Тайлбар */}
        <ol className="space-y-3">
          {stepsText.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition ${screen === i ? "border-accent/60 bg-accent/10" : "border-white/10 bg-sky-deep/60"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${screen === i ? "bg-accent text-sky-deep" : "bg-white/10 text-slate-300"}`}>{i + 1}</span>
              <span className={screen === i ? "font-medium text-white" : "text-slate-400"}>{s}</span>
            </li>
          ))}
          <li className="rounded-2xl border border-white/10 bg-sky-deep/60 p-4 text-sm text-slate-400">
            Таны талд: өдрийн бүх захиалга, орлого, ажилтны ачааллыг компьютерийн самбараас хянана.
          </li>
        </ol>
      </div>
    </Frame>
  );
}

