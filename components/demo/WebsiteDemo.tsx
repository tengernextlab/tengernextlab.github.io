"use client";

// Вэб сайтын жишээ: утас/таблет/компьютер, 3 хэл, өнгө; сайтаас захиалга өгөхөд
// эзэмшигчид шууд ирэх; Google-ийн хайлтад хэрхэн харагдах. «Жишээ кафе» зохиомол.

import { useState } from "react";
import { Frame, Panel, Tabs, useFlash } from "./ui";

type Lang = "mn" | "kz" | "en";
const L = {
  mn: { nav: ["Нүүр", "Цэс", "Холбоо барих"], hi: "Тавтай морилно уу", sub: "Өлгий хотын төвд байрлах гэр бүлийн кафе", book: "Ширээ захиалах", menu: "Цэс", contact: "Холбоо барих", addr: "Өлгий хот, 5-р баг", hours: "Өдөр бүр 09:00–22:00", items: ["Лагман", "Бэшбармак", "Сүүтэй цай"], name: "Нэр", people: "Хүний тоо", time: "Цаг", send: "Захиалах", thanks: "Баярлалаа! Удахгүй холбогдоно." },
  kz: { nav: ["Басты", "Мәзір", "Байланыс"], hi: "Қош келдіңіз", sub: "Өлгий қаласының орталығындағы отбасылық кафе", book: "Үстел брондау", menu: "Мәзір", contact: "Байланыс", addr: "Өлгий қаласы, 5-баг", hours: "Күн сайын 09:00–22:00", items: ["Лағман", "Бешбармақ", "Сүтті шай"], name: "Аты", people: "Адам саны", time: "Уақыты", send: "Брондау", thanks: "Рахмет! Жақында хабарласамыз." },
  en: { nav: ["Home", "Menu", "Contact"], hi: "Welcome", sub: "A family café in the centre of Ölgii", book: "Book a table", menu: "Menu", contact: "Contact", addr: "Ölgii, 5th bag", hours: "Daily 09:00–22:00", items: ["Lagman", "Beshbarmak", "Milk tea"], name: "Name", people: "Guests", time: "Time", send: "Book", thanks: "Thank you! We will contact you soon." },
};
const langName: Record<Lang, string> = { mn: "Монгол", kz: "Қазақ", en: "English" };
const prices = ["12,000₮", "18,000₮", "3,000₮"];
const themes = [
  { name: "Шар", c: "#f59e0b" },
  { name: "Ногоон", c: "#10b981" },
  { name: "Ягаан", c: "#ec4899" },
  { name: "Цэнхэр", c: "#38bdf8" },
];
const slots = ["12:00", "13:30", "18:00", "19:30"];

type Booking = { id: number; name: string; people: number; time: string; lang: Lang; device: string };

export default function WebsiteDemo() {
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone");
  const [lang, setLang] = useState<Lang>("mn");
  const [color, setColor] = useState(themes[0].c);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [people, setPeople] = useState(2);
  const [time, setTime] = useState(slots[2]);
  const [thanks, setThanks] = useFlash<boolean>(3500);
  const [flash, setFlash] = useFlash<number>(4000);
  const [inbox, setInbox] = useState<Booking[]>([{ id: 1, name: "Dana", people: 4, time: "13:30", lang: "en", device: "Утас" }]);

  const t = L[lang];
  const width = device === "phone" ? 320 : device === "tablet" ? 560 : 900;
  const wide = device !== "phone";
  const devName = device === "phone" ? "Утас" : device === "tablet" ? "Таблет" : "Компьютер";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const b: Booking = { id: Date.now(), name: name.trim() || "Зочин", people, time, lang, device: devName };
    setInbox((l) => [b, ...l]);
    setFlash(b.id);
    setThanks(true);
    setFormOpen(false);
    setName("");
  };

  return (
    <Frame
      sub="Нэг сайт утас, таблет, компьютерт өөрөө тохирно"
      right={<Tabs label="Дэлгэц" value={device} onChange={setDevice} options={[{ v: "phone", label: "Утас" }, { v: "tablet", label: "Таблет" }, { v: "desktop", label: "Компьютер" }]} />}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs label="Хэл" value={lang} onChange={setLang} options={(["mn", "kz", "en"] as Lang[]).map((v) => ({ v, label: langName[v] }))} />
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

      {/* Сайтын харагдац */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
        <div className="mx-auto overflow-hidden rounded-2xl border-4 border-slate-700 bg-white text-slate-800 shadow-xl transition-all duration-500" style={{ width, maxWidth: "100%" }}>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="ml-2 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-500">🔒 jishee-cafe.mn</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-bold" style={{ color }}>☕ Жишээ кафе</span>
            {wide ? <span className="flex gap-4 text-xs text-slate-600">{t.nav.map((n) => <span key={n}>{n}</span>)}</span> : <span className="text-lg text-slate-500" aria-hidden>☰</span>}
          </div>
          <div className={`px-5 py-8 ${wide ? "text-left" : "text-center"}`} style={{ background: `${color}22` }}>
            <p className={`font-bold ${wide ? "text-3xl" : "text-2xl"}`}>{t.hi}</p>
            <p className="mt-2 text-sm text-slate-600">{t.sub}</p>
            {thanks ? (
              <p className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold" style={{ color }}>✓ {t.thanks}</p>
            ) : (
              <button onClick={() => setFormOpen((v) => !v)} className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: color }}>
                {t.book}
              </button>
            )}
            {formOpen && (
              <form onSubmit={submit} className={`mt-4 grid gap-2 rounded-2xl bg-white p-4 text-left text-sm shadow ${wide ? "max-w-md grid-cols-2" : "grid-cols-1"}`}>
                <label className={wide ? "col-span-2" : ""}>
                  <span className="text-xs text-slate-500">{t.name}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Болд" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
                </label>
                <label>
                  <span className="text-xs text-slate-500">{t.people}</span>
                  <select value={people} onChange={(e) => setPeople(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                    {[1, 2, 3, 4, 5, 6, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs text-slate-500">{t.time}</span>
                  <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                    {slots.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <button type="submit" className={`rounded-full py-2 font-semibold text-white ${wide ? "col-span-2" : ""}`} style={{ background: color }}>{t.send}</button>
              </form>
            )}
          </div>
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
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{t.contact}</p>
            <p className="mt-1">📍 {t.addr} · 🕘 {t.hours}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="📥 Сайтаас ирсэн захиалга (эзэмшигчид)">
          <ul className="space-y-2">
            {inbox.map((b) => (
              <li key={b.id} className={`rounded-xl border p-3 text-sm transition ${flash === b.id ? "border-accent bg-accent/15 ring-2 ring-accent/60" : "border-white/10 bg-white/[0.03]"}`}>
                <p className="text-white">
                  {b.name} · {b.people} хүн · {b.time}
                  {flash === b.id && <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-sky-deep">ШИНЭ</span>}
                </p>
                <p className="text-xs text-slate-400">Хэл: {langName[b.lang]} · Төхөөрөмж: {b.device}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Сайтын «{L.mn.book}» товчоор захиалга өгөхөд энд болон таны имэйл, утсанд шууд ирнэ.</p>
        </Panel>

        <Panel title="🔎 Google хайлтад ингэж харагдана">
          <div className="rounded-xl bg-white p-4 text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm" style={{ background: `${color}33` }}>☕</span>
              <div className="leading-tight">
                <p className="text-xs text-slate-800">Жишээ кафе</p>
                <p className="text-[11px] text-slate-500">https://jishee-cafe.mn</p>
              </div>
            </div>
            <p className="mt-2 text-lg leading-snug text-[#1a0dab]">Жишээ кафе — {t.sub}</p>
            <p className="mt-1 text-sm text-slate-600">{t.hours}. {t.menu}: {t.items.join(", ")}. {t.addr}.</p>
          </div>
          <p className="mt-3 text-xs text-slate-500">Гарчиг, тайлбар, газрын зураг дээрх байршлыг тохируулж, хүмүүс «Өлгий кафе» гэж хайхад танай сайт гарч ирэх магадлалыг нэмэгдүүлнэ.</p>
        </Panel>
      </div>
    </Frame>
  );
}
