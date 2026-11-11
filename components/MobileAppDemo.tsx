"use client";

// Гар утасны апп-ын дэлгэрэнгүй жишээ: харилцагчийн апп + эзэмшигчийн самбар.
// Бүх нэр, үнэ, тоо зохиомол.

import { useEffect, useState } from "react";

/* ---------- Өгөгдөл ---------- */

const services = [
  { id: "out", name: "Гадна угаалга", price: 15000, min: 30, icon: "🚿", desc: "Их бие, дугуй, шил" },
  { id: "full", name: "Бүтэн угаалга", price: 35000, min: 60, icon: "✨", desc: "Гадна, дотор, тоос сорох, өнгөлгөө" },
  { id: "in", name: "Дотор цэвэрлэгээ", price: 25000, min: 45, icon: "🧽", desc: "Суудал, хивс, самбар" },
];
const cars = [
  { id: "sedan", name: "Суудлын", k: 1 },
  { id: "suv", name: "Жийп", k: 1.3 },
  { id: "van", name: "Микро", k: 1.5 },
];
const days = ["Өнөөдөр", "Маргааш"];
const times = ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];
const POINT_VALUE = 5000; // 100 оноо = 5,000₮

type Status = "waiting" | "washing" | "done" | "cancelled";
type Booking = {
  id: number;
  who: string;
  mine: boolean;
  svc: string;
  car: string;
  day: number;
  time: string;
  price: number;
  pay: "qpay" | "cash";
  paid: boolean;
  usedPoints: number;
  earned: number;
  status: Status;
};
type Note = { id: number; text: string; t: string };

const seed: Booking[] = [
  { id: 1, who: "Ерлан", mine: false, svc: "out", car: "sedan", day: 0, time: "09:00", price: 15000, pay: "qpay", paid: true, usedPoints: 0, earned: 15, status: "done" },
  { id: 2, who: "Сараа", mine: false, svc: "full", car: "suv", day: 0, time: "10:00", price: 46000, pay: "qpay", paid: true, usedPoints: 0, earned: 46, status: "washing" },
  { id: 3, who: "Айбек", mine: false, svc: "in", car: "sedan", day: 0, time: "14:30", price: 25000, pay: "cash", paid: false, usedPoints: 0, earned: 25, status: "waiting" },
  { id: 4, who: "Тэмүүлэн", mine: false, svc: "out", car: "van", day: 1, time: "11:30", price: 23000, pay: "qpay", paid: true, usedPoints: 0, earned: 23, status: "waiting" },
  { id: 5, who: "Болд (та)", mine: true, svc: "out", car: "sedan", day: -1, time: "16:00", price: 15000, pay: "qpay", paid: true, usedPoints: 0, earned: 15, status: "done" },
];

const money = (n: number) => `${n.toLocaleString("en-US")}₮`;
const round1000 = (n: number) => Math.round(n / 1000) * 1000;
const svcOf = (id: string) => services.find((s) => s.id === id)!;
const carOf = (id: string) => cars.find((c) => c.id === id)!;
const dayName = (d: number) => (d === -1 ? "Өчигдөр" : days[d]);

const statusInfo: Record<Status, { label: string; cls: string }> = {
  waiting: { label: "Хүлээгдэж буй", cls: "bg-amber-100 text-amber-700" },
  washing: { label: "Угааж байна", cls: "bg-sky-100 text-sky-700" },
  done: { label: "Дууссан", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Цуцалсан", cls: "bg-slate-100 text-slate-500" },
};
const statusDark: Record<Status, string> = {
  waiting: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  washing: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  done: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-white/15 bg-white/5 text-slate-400",
};
const statusIcon: Record<Status, string> = { waiting: "⏳", washing: "🫧", done: "✓", cancelled: "✕" };

/* ---------- Жижиг хэсгүүд ---------- */

function FakeQR() {
  // Жинхэнэ QR биш — зөвхөн дүрслэл
  const n = 21;
  const cells: boolean[] = [];
  let x = 7;
  for (let i = 0; i < n * n; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    cells.push(x % 3 === 0);
  }
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    const box = inBox(0, 0) ? [0, 0] : inBox(0, n - 7) ? [0, n - 7] : inBox(n - 7, 0) ? [n - 7, 0] : null;
    if (!box) return null;
    const rr = r - box[0], cc = c - box[1];
    return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
  };
  return (
    <div className="grid h-40 w-40 bg-white p-2" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} aria-label="Жишээ QR код">
      {cells.map((on, i) => {
        const f = finder(Math.floor(i / n), i % n);
        return <span key={i} className={(f ?? on) ? "bg-slate-900" : ""} />;
      })}
    </div>
  );
}

function Pill({ active, disabled, onClick, children }: { active?: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-2 py-2 text-xs font-medium transition ${
        disabled ? "bg-slate-100 text-slate-300 line-through" : active ? "bg-sky-500 text-white" : "bg-white ring-1 ring-slate-200 hover:ring-sky-400"
      }`}
    >
      {children}
    </button>
  );
}

function Header({ title, back }: { title: string; back?: () => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
      {back && (
        <button onClick={back} className="text-lg leading-none text-sky-600" aria-label="Буцах">
          ‹
        </button>
      )}
      <p className="font-semibold">{title}</p>
    </div>
  );
}

/* ---------- Үндсэн жишээ ---------- */

type Screen = "home" | "service" | "when" | "summary" | "qpay" | "done" | "orders" | "points" | "profile" | "notifs";

export default function MobileAppDemo() {
  const [bookings, setBookings] = useState<Booking[]>(seed);
  const [points, setPoints] = useState(135);
  const [notes, setNotes] = useState<Note[]>([{ id: 1, text: "Мягмар гарагт бүх угаалга 20% хямдралтай 🎉", t: "Өчигдөр" }]);
  const [unread, setUnread] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [flash, setFlash] = useState<number | null>(null);
  const [dashDay, setDashDay] = useState(0);
  const [clock, setClock] = useState(0);

  // захиалгын түр сонголт
  const [svc, setSvc] = useState("out");
  const [car, setCar] = useState("sedan");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [usePts, setUsePts] = useState(false);
  const [pay, setPay] = useState<"qpay" | "cash">("qpay");
  const [last, setLast] = useState<Booking | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const nowLabel = () => {
    const m = 9 * 60 + 40 + clock;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  };
  const notify = (text: string) => {
    setNotes((n) => [{ id: Date.now(), text, t: nowLabel() }, ...n]);
    setUnread((u) => u + 1);
    setToast(text);
    setClock((c) => c + 4);
  };

  const base = round1000(svcOf(svc).price * carOf(car).k);
  const discount = usePts && points >= 100 ? POINT_VALUE : 0;
  const total = base - discount;
  const earn = Math.round(total / 1000);
  const taken = (d: number, t: string) => bookings.some((b) => b.day === d && b.time === t && b.status !== "cancelled");

  const startBooking = (id: string) => {
    setSvc(id);
    setTime(null);
    setUsePts(false);
    setScreen("service");
  };

  const confirm = () => {
    const b: Booking = {
      id: Date.now(),
      who: "Болд (та)",
      mine: true,
      svc,
      car,
      day,
      time: time!,
      price: total,
      pay,
      paid: pay === "qpay",
      usedPoints: discount ? 100 : 0,
      earned: earn,
      status: "waiting",
    };
    setBookings((l) => [...l, b]);
    setPoints((p) => p - b.usedPoints + b.earned);
    setLast(b);
    setDashDay(day);
    setFlash(b.id);
    setScreen("done");
    notify(`Захиалга баталгаажлаа: ${dayName(day).toLowerCase()} ${b.time}. 15 минутын өмнө сануулна.`);
  };

  const cancel = (b: Booking) => {
    setBookings((l) => l.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)));
    setPoints((p) => p + b.usedPoints - b.earned);
    notify(`${b.time}-ийн захиалга цуцлагдлаа.${b.paid ? " Төлбөр 1 цагийн дотор буцаагдана." : ""}`);
  };

  const advance = (b: Booking) => {
    const next: Status = b.status === "waiting" ? "washing" : "done";
    setBookings((l) => l.map((x) => (x.id === b.id ? { ...x, status: next, paid: next === "done" ? true : x.paid } : x)));
    if (b.mine) notify(next === "washing" ? "Таны машиныг угааж эхэллээ 🫧" : "Таны машин бэлэн боллоо! Ирж авна уу 🚗");
  };

  const mine = bookings.filter((b) => b.mine).sort((a, b) => b.day - a.day || a.time.localeCompare(b.time));
  const tabs: { id: Screen; label: string; icon: string }[] = [
    { id: "home", label: "Нүүр", icon: "🏠" },
    { id: "orders", label: "Захиалга", icon: "📋" },
    { id: "points", label: "Оноо", icon: "⭐" },
    { id: "profile", label: "Би", icon: "👤" },
  ];
  const tabActive = (id: Screen) => screen === id || (id === "home" && ["service", "when", "summary", "qpay", "done", "notifs"].includes(screen));

  /* ----- Утасны дэлгэцүүд ----- */
  let body: React.ReactNode = null;

  if (screen === "home") {
    body = (
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500">Сайн байна уу,</p>
            <p className="text-lg font-bold">Болд 👋</p>
          </div>
          <button
            onClick={() => {
              setUnread(0);
              setScreen("notifs");
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-slate-200"
            aria-label="Мэдэгдэл"
          >
            🔔
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
        </div>
        <button onClick={() => setScreen("points")} className="mt-3 block w-full rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-left text-white">
          <p className="text-xs opacity-80">Таны бонус оноо</p>
          <p className="text-2xl font-bold">{points}</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/25">
            <div className="h-1.5 rounded-full bg-white" style={{ width: `${Math.min(100, (points / 200) * 100)}%` }} />
          </div>
          <p className="mt-1 text-[11px] opacity-80">{points >= 200 ? "Үнэгүй угаалга авах боломжтой!" : `Үнэгүй угаалга хүртэл ${200 - points} оноо`}</p>
        </button>
        <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">🎉 Мягмар гараг бүр 20% хямдрал</div>
        <p className="mt-4 text-sm font-semibold">Үйлчилгээ</p>
        <div className="mt-2 space-y-2">
          {services.map((w) => (
            <button key={w.id} onClick={() => startBooking(w.id)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-sky-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-lg">{w.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{w.name}</span>
                <span className="block text-[11px] text-slate-500">{w.min} мин · {w.desc}</span>
                <span className="mt-0.5 block text-xs font-semibold text-sky-600">{money(w.price)}-с</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "service") {
    body = (
      <>
        <Header title={svcOf(svc).name} back={() => setScreen("home")} />
        <div className="p-4">
          <p className="text-xs text-slate-500">{svcOf(svc).desc} · {svcOf(svc).min} мин</p>
          <p className="mt-4 text-sm font-semibold">Машины төрөл</p>
          <div className="mt-2 space-y-2">
            {cars.map((c) => (
              <button
                key={c.id}
                onClick={() => setCar(c.id)}
                className={`flex w-full items-center justify-between rounded-2xl p-3 text-sm transition ${car === c.id ? "bg-sky-50 ring-2 ring-sky-500" : "bg-white ring-1 ring-slate-200"}`}
              >
                <span>{c.id === "sedan" ? "🚗" : c.id === "suv" ? "🚙" : "🚐"} {c.name}</span>
                <span className="font-semibold">{money(round1000(svcOf(svc).price * c.k))}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setScreen("when")} className="mt-6 w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white">
            Үргэлжлүүлэх
          </button>
        </div>
      </>
    );
  }

  if (screen === "when") {
    body = (
      <>
        <Header title="Өдөр, цаг сонгох" back={() => setScreen("service")} />
        <div className="flex flex-1 flex-col p-4">
          <div className="grid grid-cols-2 gap-2">
            {days.map((d, i) => (
              <Pill
                key={d}
                active={day === i}
                onClick={() => {
                  setDay(i);
                  setTime(null);
                }}
              >
                {d}
              </Pill>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold">Сул цаг</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {times.map((t) => (
              <Pill key={t} active={time === t} disabled={taken(day, t)} onClick={() => setTime(t)}>
                {t}
              </Pill>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Зураастай цагийг өөр хүн захиалсан. Самбар дээр харагдана →</p>
          <button disabled={!time} onClick={() => setScreen("summary")} className="mt-auto w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white disabled:bg-slate-300">
            {time ? "Үргэлжлүүлэх" : "Цаг сонгоно уу"}
          </button>
        </div>
      </>
    );
  }

  if (screen === "summary") {
    body = (
      <>
        <Header title="Захиалга шалгах" back={() => setScreen("when")} />
        <div className="flex flex-1 flex-col p-4 text-sm">
          <div className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="flex justify-between"><span className="text-slate-500">Үйлчилгээ</span><span>{svcOf(svc).name}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Машин</span><span>{carOf(car).name}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Хэзээ</span><span>{days[day]} {time}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Үнэ</span><span>{money(base)}</span></p>
            {discount > 0 && <p className="flex justify-between text-emerald-600"><span>Оноогоор хямдрал</span><span>−{money(discount)}</span></p>}
            <p className="flex justify-between border-t border-slate-100 pt-2 font-bold"><span>Нийт</span><span>{money(total)}</span></p>
          </div>
          <label className={`mt-3 flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200 ${points < 100 ? "opacity-50" : ""}`}>
            <span className="text-xs">⭐ 100 оноогоор {money(POINT_VALUE)} хасах<br /><span className="text-slate-400">Танд {points} оноо байна</span></span>
            <input type="checkbox" disabled={points < 100} checked={usePts} onChange={(e) => setUsePts(e.target.checked)} className="h-5 w-5 accent-sky-500" />
          </label>
          <p className="mt-4 text-sm font-semibold">Төлбөр</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Pill active={pay === "qpay"} onClick={() => setPay("qpay")}>QPay</Pill>
            <Pill active={pay === "cash"} onClick={() => setPay("cash")}>Газар дээр нь</Pill>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Энэ захиалгаар +{earn} оноо цуглуулна.</p>
          <button onClick={() => (pay === "qpay" ? setScreen("qpay") : confirm())} className="mt-auto w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white">
            {pay === "qpay" ? `${money(total)} төлөх` : "Захиалах"}
          </button>
        </div>
      </>
    );
  }

  if (screen === "qpay") {
    body = (
      <>
        <Header title="QPay-ээр төлөх" back={() => setScreen("summary")} />
        <div className="flex flex-1 flex-col items-center p-4 text-center">
          <p className="text-2xl font-bold">{money(total)}</p>
          <p className="text-xs text-slate-500">Банкны аппаараа уншуулна уу</p>
          <div className="mt-4 rounded-2xl p-2 ring-1 ring-slate-200">
            <FakeQR />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Энэ бол жишээ дүрслэл — жинхэнэ QR биш.</p>
          <p className="mt-3 text-[11px] text-slate-500">Аль ч банкны аппаар уншуулж төлөх боломжтой.</p>
          <button onClick={confirm} className="mt-auto w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white">
            Төлбөр төлөгдсөн (жишээ)
          </button>
        </div>
      </>
    );
  }

  if (screen === "done" && last) {
    body = (
      <div className="flex flex-1 flex-col p-4 text-center">
        <div className="mt-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
          <p className="mt-4 text-lg font-bold">Захиалга баталгаажлаа</p>
          <p className="mt-1 text-sm text-slate-500">{svcOf(last.svc).name} · {carOf(last.car).name}</p>
          <p className="text-sm text-slate-500">{days[last.day]} {last.time} · {last.paid ? "Төлсөн" : "Газар дээр нь төлнө"}</p>
          <p className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">+{last.earned} бонус оноо</p>
          <p className="mt-6 rounded-2xl bg-sky-50 p-3 text-xs text-sky-800">
            👉 Баруун талын <b>эзэмшигчийн самбар</b> дээр таны захиалга шууд гарч ирлээ. Тэндээс «Угааж эхлэх» дарахад танд мэдэгдэл ирнэ.
          </p>
        </div>
        <button onClick={() => setScreen("orders")} className="mt-auto w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white">
          Миний захиалгууд
        </button>
      </div>
    );
  }

  if (screen === "orders") {
    body = (
      <>
        <Header title="Миний захиалгууд" />
        <div className="space-y-2 p-4">
          {mine.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white p-3 text-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{svcOf(b.svc).name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusInfo[b.status].cls}`}>{statusInfo[b.status].label}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{dayName(b.day)} {b.time} · {carOf(b.car).name} · {money(b.price)}</p>
              {b.status === "waiting" && (
                <button onClick={() => cancel(b)} className="mt-2 text-xs font-medium text-red-500">
                  Цуцлах
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setScreen("home")} className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500">
            + Шинэ захиалга
          </button>
        </div>
      </>
    );
  }

  if (screen === "points") {
    body = (
      <>
        <Header title="Бонус оноо" />
        <div className="p-4 text-sm">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white">
            <p className="text-xs opacity-90">Нийт оноо</p>
            <p className="text-3xl font-bold">{points}</p>
            <p className="text-[11px] opacity-90">1,000₮ тутамд 1 оноо</p>
          </div>
          <p className="mt-4 font-semibold">Шагнал</p>
          {[
            { need: 100, text: `${money(POINT_VALUE)} хямдрал` },
            { need: 200, text: "Үнэгүй гадна угаалга" },
            { need: 400, text: "Үнэгүй бүтэн угаалга" },
          ].map((r) => (
            <div key={r.need} className="mt-2 flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <span>{r.text}<br /><span className="text-xs text-slate-400">{r.need} оноо</span></span>
              {points >= r.need ? <span className="text-xs font-semibold text-emerald-600">Боломжтой ✓</span> : <span className="text-xs text-slate-400">{r.need - points} дутуу</span>}
            </div>
          ))}
          <p className="mt-4 font-semibold">Түүх</p>
          {mine
            .filter((b) => b.status !== "cancelled")
            .map((b) => (
              <p key={b.id} className="mt-2 flex justify-between text-xs text-slate-600">
                <span>{dayName(b.day)} · {svcOf(b.svc).name}</span>
                <span className="font-semibold text-emerald-600">+{b.earned}{b.usedPoints ? ` / −${b.usedPoints}` : ""}</span>
              </p>
            ))}
        </div>
      </>
    );
  }

  if (screen === "profile") {
    body = (
      <>
        <Header title="Миний мэдээлэл" />
        <div className="p-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-600">Б</span>
            <div>
              <p className="font-semibold">Б. Болд</p>
              <p className="text-xs text-slate-500">9911 **** · Байнгын харилцагч</p>
            </div>
          </div>
          <p className="mt-5 font-semibold">Миний машин</p>
          <div className="mt-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
            🚗 Toyota Prius · <span className="rounded bg-slate-100 px-1.5 font-mono text-xs">0000 ЖШЭ</span>
          </div>
          <p className="mt-5 font-semibold">Тохиргоо</p>
          {["Захиалгын сануулга", "Урамшууллын мэдээ"].map((s) => (
            <label key={s} className="mt-2 flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              {s}
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-sky-500" />
            </label>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200">
            Хэл <span className="text-xs text-slate-500">Монгол · Қазақ · English</span>
          </div>
        </div>
      </>
    );
  }

  if (screen === "notifs") {
    body = (
      <>
        <Header title="Мэдэгдэл" back={() => setScreen("home")} />
        <div className="space-y-2 p-4">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl bg-white p-3 text-xs ring-1 ring-slate-200">
              <p>{n.text}</p>
              <p className="mt-1 text-[10px] text-slate-400">{n.t}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  /* ----- Эзэмшигчийн самбар ----- */
  const dayList = bookings.filter((b) => b.day === dashDay).sort((a, b) => a.time.localeCompare(b.time));
  const active = dayList.filter((b) => b.status !== "cancelled");
  const revenue = active.filter((b) => b.paid).reduce((s, b) => s + b.price, 0);
  const expected = active.reduce((s, b) => s + b.price, 0);
  const free = times.filter((t) => !taken(dashDay, t)).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-accent/5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-wider text-accent">Жишээ · дарж туршаарай</p>
        <p className="mt-1 text-sm text-slate-400">Зүүн талд харилцагчийн апп, баруун талд таны (эзэмшигчийн) самбар. Хоёулаа хоорондоо холбоотой ажиллана.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        {/* Утас */}
        <div>
          <p className="mb-2 text-center text-xs font-medium text-slate-400">📱 Харилцагчийн апп</p>
          <div className="mx-auto w-[290px] rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-900 shadow-2xl">
            <div className="relative flex h-[600px] flex-col overflow-hidden rounded-[1.8rem] bg-slate-50 text-slate-800">
              {/* статус мөр */}
              <div className="flex items-center justify-between px-5 pb-1 pt-2 text-[10px] font-semibold text-slate-600">
                <span>{nowLabel()}</span>
                <span className="h-4 w-20 rounded-full bg-slate-800" />
                <span>📶 🔋</span>
              </div>
              {/* мэдэгдэл */}
              {toast && (
                <div className="absolute inset-x-2 top-8 z-20 rounded-2xl bg-slate-800/95 p-3 text-xs text-white shadow-xl">
                  <p className="font-semibold">🔔 Жишээ угаалга</p>
                  <p className="mt-0.5">{toast}</p>
                </div>
              )}
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{body}</div>
              {/* доод цэс */}
              <nav className="grid grid-cols-4 border-t border-slate-200 bg-white pb-2 pt-1.5">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setScreen(t.id)} className={`flex flex-col items-center text-[10px] ${tabActive(t.id) ? "font-semibold text-sky-600" : "text-slate-400"}`}>
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Самбар */}
        <div>
          <p className="mb-2 text-center text-xs font-medium text-slate-400 lg:text-left">💻 Эзэмшигчийн самбар (компьютер)</p>
          <div className="rounded-2xl border border-white/10 bg-sky-deep/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-white">Жишээ угаалга · захиалгууд</p>
              <div role="group" aria-label="Өдөр" className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
                {days.map((d, i) => (
                  <button key={d} aria-pressed={dashDay === i} onClick={() => setDashDay(i)} className={`rounded-full px-3 py-1.5 ${dashDay === i ? "bg-accent font-medium text-sky-deep" : "text-slate-300"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: "Захиалга", v: active.length },
                { l: "Сул цаг", v: free },
                { l: "Төлөгдсөн", v: money(revenue) },
                { l: "Нийт хүлээгдэж буй", v: money(expected) },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-slate-400">{k.l}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{k.v}</p>
                </div>
              ))}
            </div>

            <ul className="mt-4 space-y-2">
              {dayList.length === 0 && <li className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">Энэ өдөр захиалга алга.</li>}
              {dayList.map((b) => (
                <li
                  key={b.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition ${
                    flash === b.id ? "border-accent bg-accent/15 ring-2 ring-accent/60" : "border-white/10 bg-white/[0.03]"
                  } ${b.status === "cancelled" ? "opacity-50" : ""}`}
                >
                  <span className="w-12 text-sm font-bold text-white">{b.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      {b.who} {flash === b.id && <span className="ml-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-sky-deep">ШИНЭ</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {svcOf(b.svc).name} · {carOf(b.car).name} · {money(b.price)} · {b.paid ? "Төлсөн" : "Газар дээр нь"}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusDark[b.status]}`}>
                      <span aria-hidden>{statusIcon[b.status]}</span>
                      {statusInfo[b.status].label}
                    </span>
                    {(b.status === "waiting" || b.status === "washing") && (
                      <button onClick={() => advance(b)} className="whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-sky-deep hover:bg-sky-300">
                        {b.status === "waiting" ? "Угааж эхлэх" : "Дууссан"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Апп-аас захиалга орж ирэхэд энд шууд гарна. «Угааж эхлэх», «Дууссан» дарахад харилцагчийн утсанд мэдэгдэл очно.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { t: "1. Захиалах", d: "Үйлчилгээ, машин, цагаа сонгоно" },
              { t: "2. Төлөх", d: "QPay эсвэл газар дээр нь, оноогоор хямдруулна" },
              { t: "3. Мэдэгдэл", d: "Эхлэх, дуусах үед утсанд мэдэгдэл ирнэ" },
            ].map((s) => (
              <div key={s.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-semibold text-white">{s.t}</p>
                <p className="mt-1 text-xs text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
