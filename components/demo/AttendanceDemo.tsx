"use client";

// Цаг бүртгэлийн жишээ: ажилтны утас (QR-аар бүртгүүлэх) + менежерийн самбар + сарын цалин.
// Бүх нэр, тоо зохиомол.

import { useEffect, useState } from "react";
import { Badge, Frame, Panel, Phone, Stat, Tabs, btnGhost, btnMain, money, useFlash } from "./ui";

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const START = "09:00";
const END = "18:00";
const NOW_IN = "09:21";
const NOW_OUT = "18:10";

type Emp = { name: string; role: string; in: string | null; out: string | null; salary: number; lateMonth: number; otMonth: number; absent: number; days: number };

const initial: Emp[] = [
  { name: "Б. Болд", role: "Кассчин", in: "08:52", out: null, salary: 1200000, lateMonth: 0, otMonth: 6, absent: 0, days: 22 },
  { name: "Г. Сараа", role: "Нягтлан", in: "09:14", out: null, salary: 1800000, lateMonth: 47, otMonth: 0, absent: 1, days: 21 },
  { name: "А. Ерлан", role: "Жолооч", in: "08:45", out: null, salary: 1400000, lateMonth: 0, otMonth: 14, absent: 0, days: 22 },
  { name: "Т. Айгерим", role: "Борлуулагч", in: null, out: null, salary: 1100000, lateMonth: 85, otMonth: 2, absent: 3, days: 19 },
  { name: "Д. Тэмүүлэн", role: "Нярав", in: "09:03", out: null, salary: 1300000, lateMonth: 12, otMonth: 4, absent: 0, days: 22 },
];

const initialLog = ["09:14 · Г. Сараа ирлээ (QR)", "09:03 · Д. Тэмүүлэн ирлээ (QR)", "08:52 · Б. Болд ирлээ (QR)", "08:45 · А. Ерлан ирлээ (QR)"];

const LATE_FINE = 500; // 1 минут хоцролт = 500₮ (жишээ дүрэм)
const OT_RATE = 1.5;

export default function AttendanceDemo() {
  const [emps, setEmps] = useState<Emp[]>(initial);
  const [tab, setTab] = useState<"today" | "salary">("today");
  const [me, setMe] = useState(3); // утсан дээрх ажилтан
  const [stage, setStage] = useState<"home" | "scan" | "ok">("home");
  const [kind, setKind] = useState<"in" | "out">("in");
  const [log, setLog] = useState<string[]>(initialLog);
  const [flash, setFlash] = useFlash<number>(4000);
  const [toast, setToast] = useFlash<string>(3200);

  const e = emps[me];

  // QR уншуулж буй мэт 1.4 секунд хүлээгээд бүртгэнэ
  useEffect(() => {
    if (stage !== "scan") return;
    const t = setTimeout(() => {
      const time = kind === "in" ? NOW_IN : NOW_OUT;
      setEmps((l) => l.map((x, i) => (i === me ? { ...x, [kind]: time } : x)));
      setLog((l) => [`${time} · ${emps[me].name} ${kind === "in" ? "ирлээ" : "явлаа"} (QR, байршил ✓)`, ...l].slice(0, 6));
      setFlash(me);
      if (kind === "in" && toMin(time) > toMin(START)) setToast(`Менежерт: ${emps[me].name} ${toMin(time) - toMin(START)} минут хоцорч ирлээ`);
      setStage("ok");
    }, 1400);
    return () => clearTimeout(t);
  }, [stage, kind, me, emps, setFlash, setToast]);

  const present = emps.filter((x) => x.in).length;
  const late = emps.filter((x) => x.in && toMin(x.in) > toMin(START)).length;

  const statusOf = (x: Emp) => {
    if (!x.in) return <Badge tone="bad">Ирээгүй</Badge>;
    const lateBy = toMin(x.in) - toMin(START);
    return lateBy > 0 ? <Badge tone="warn">{lateBy} мин хоцорсон</Badge> : <Badge tone="good">Цагтаа</Badge>;
  };

  /* ----- Утас ----- */
  let screen: React.ReactNode;
  if (stage === "home") {
    screen = (
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-slate-500">Ажилтан:</p>
        <select
          value={me}
          onChange={(ev) => setMe(Number(ev.target.value))}
          className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200"
          aria-label="Ажилтан сонгох"
        >
          {emps.map((x, i) => (
            <option key={x.name} value={i}>
              {x.name} — {x.role}
            </option>
          ))}
        </select>
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">Өнөөдөр · ажлын цаг {START}–{END}</p>
          <p className="mt-2 flex justify-between"><span>Ирсэн</span><b>{e.in ?? "—"}</b></p>
          <p className="mt-1 flex justify-between"><span>Явсан</span><b>{e.out ?? "—"}</b></p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl bg-white p-2 ring-1 ring-slate-200"><p className="text-slate-500">Энэ сарын хоцролт</p><p className="font-bold">{e.lateMonth} мин</p></div>
          <div className="rounded-xl bg-white p-2 ring-1 ring-slate-200"><p className="text-slate-500">Илүү цаг</p><p className="font-bold">{e.otMonth} цаг</p></div>
        </div>
        <div className="mt-auto">
          {!e.in ? (
            <button onClick={() => { setKind("in"); setStage("scan"); }} className="w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white">
              📷 QR уншуулж «Ирлээ»
            </button>
          ) : !e.out ? (
            <button onClick={() => { setKind("out"); setStage("scan"); }} className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white">
              📷 QR уншуулж «Явлаа»
            </button>
          ) : (
            <p className="rounded-2xl bg-emerald-50 p-3 text-center text-xs text-emerald-700">Өнөөдрийн бүртгэл бүрэн ✓</p>
          )}
        </div>
      </div>
    );
  } else if (stage === "scan") {
    screen = (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-900 p-4 text-center text-white">
        <div className="relative h-44 w-44 rounded-3xl border-4 border-sky-400">
          <div className="absolute inset-x-3 top-1/2 h-0.5 animate-pulse bg-sky-400 shadow-[0_0_12px_#38bdf8]" />
          <div className="absolute inset-6 grid grid-cols-5 gap-1 opacity-40">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className={(i * 7) % 3 === 0 ? "bg-white" : ""} />
            ))}
          </div>
        </div>
        <p className="mt-5 text-sm">Үүдэнд байрлах QR кодыг уншуулж байна…</p>
        <p className="mt-1 text-xs text-slate-400">📍 Байршил шалгаж байна</p>
      </div>
    );
  } else {
    const t = kind === "in" ? e.in : e.out;
    const lateBy = kind === "in" && e.in ? toMin(e.in) - toMin(START) : 0;
    const ot = kind === "out" && e.out ? toMin(e.out) - toMin(END) : 0;
    screen = (
      <div className="flex flex-1 flex-col p-4 text-center">
        <div className="mt-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
          <p className="mt-4 text-lg font-bold">{kind === "in" ? "Ирц бүртгэгдлээ" : "Явсан цаг бүртгэгдлээ"}</p>
          <p className="text-3xl font-bold text-sky-600">{t}</p>
          <p className="mt-2 text-xs text-slate-500">📍 Ажлын байранд байна · QR баталгаажсан</p>
          {lateBy > 0 && <p className="mt-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{lateBy} минут хоцорсон</p>}
          {ot > 0 && <p className="mt-3 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">+{ot} минут илүү цаг</p>}
          <p className="mt-6 rounded-2xl bg-sky-50 p-3 text-xs text-sky-800">👉 Баруун талын менежерийн самбар дээр шууд харагдлаа.</p>
        </div>
        <button onClick={() => setStage("home")} className="mt-auto w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white">Буцах</button>
      </div>
    );
  }

  /* ----- Цалин ----- */
  const rows = emps.map((x) => {
    const hourly = x.salary / 176;
    const otPay = x.otMonth * hourly * OT_RATE;
    const fine = x.lateMonth * LATE_FINE;
    const absentCut = x.absent * (x.salary / 22);
    return { ...x, otPay, fine, absentCut, net: x.salary + otPay - fine - absentCut };
  });

  return (
    <Frame sub="Зүүн талд ажилтны утас, баруун талд менежерийн самбар. Хоёулаа хоорондоо холбоотой.">
      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <Phone label="Ажилтны утас" time={stage === "home" ? "09:21" : kind === "in" ? NOW_IN : NOW_OUT} toast={null}>
          {screen}
        </Phone>

        <div>
          <p className="mb-2 text-center text-xs font-medium text-slate-400 lg:text-left">💻 Менежерийн самбар</p>
          {toast && <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">🔔 {toast}</div>}
          <Panel
            title="Ажилтны ирц"
            right={<Tabs label="Харах" value={tab} onChange={setTab} options={[{ v: "today", label: "Өнөөдөр" }, { v: "salary", label: "Сарын цалин" }]} />}
          >
            {tab === "today" ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Ирсэн" value={`${present}/${emps.length}`} />
                  <Stat label="Хоцорсон" value={late} />
                  <Stat label="Ирээгүй" value={emps.length - present} />
                </div>
                <ul className="mt-3 space-y-2">
                  {emps.map((x, i) => {
                    const ot = x.out ? toMin(x.out) - toMin(END) : 0;
                    return (
                      <li key={x.name} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition ${flash === i ? "border-accent bg-accent/15 ring-2 ring-accent/60" : "border-white/10 bg-white/[0.03]"}`}>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{x.name.split(" ")[1][0]}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">{x.name}</p>
                          <p className="text-xs text-slate-400">{x.role} · ирсэн {x.in ?? "—"} · явсан {x.out ?? "—"}</p>
                        </div>
                        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                          {statusOf(x)}
                          {ot > 0 && <Badge tone="info">+{ot} мин илүү</Badge>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-semibold text-slate-300">Сүүлийн бүртгэл</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {log.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                  <Badge tone="info">Илүү цаг ×{OT_RATE}</Badge>
                  <Badge tone="info">Хоцролт 1 мин = {money(LATE_FINE)}</Badge>
                  <Badge tone="info">Тасалсан өдөр = өдрийн цалин хасна</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="text-xs text-slate-400">
                      <tr className="border-b border-white/10">
                        <th className="p-2 font-medium">Ажилтан</th>
                        <th className="p-2 text-right font-medium">Үндсэн</th>
                        <th className="p-2 text-right font-medium">Илүү цаг</th>
                        <th className="p-2 text-right font-medium">Хоцролт</th>
                        <th className="p-2 text-right font-medium">Тасалсан</th>
                        <th className="p-2 text-right font-medium">Олгох</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {rows.map((r) => (
                        <tr key={r.name}>
                          <td className="p-2 font-medium text-white">{r.name}</td>
                          <td className="p-2 text-right">{money(r.salary)}</td>
                          <td className="p-2 text-right text-emerald-300">{r.otPay ? `+${money(r.otPay)}` : "—"}</td>
                          <td className="p-2 text-right text-amber-300">{r.fine ? `−${money(r.fine)}` : "—"}</td>
                          <td className="p-2 text-right text-red-300">{r.absentCut ? `−${money(r.absentCut)}` : "—"}</td>
                          <td className="p-2 text-right font-semibold text-white">{money(r.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Татвар, шимтгэлийг оруулаагүй жишээ. Дүрмийг танай байгууллагын журмаар тохируулна.</p>
                  <button className={btnGhost} onClick={() => setToast("Жишээ: бодит системд Excel файл татагдана")}>⬇ Excel татах</button>
                </div>
              </>
            )}
          </Panel>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={btnMain} onClick={() => { setEmps(initial); setLog(initialLog); setStage("home"); }}>Жишээг дахин эхлүүлэх</button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
