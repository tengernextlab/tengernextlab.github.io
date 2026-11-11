"use client";

// Агуулахын жишээ: үлдэгдэл, касс (борлуулалт), хугацаа дуусах сануулга,
// автомат татан авах жагсаалт → нийлүүлэгч рүү илгээх → хүлээн авах. Бүх тоо зохиомол.

import { useState } from "react";
import { Badge, Frame, Panel, Stat, Tabs, btnGhost, btnMain, money, useFlash, type Tone } from "./ui";

type Item = { id: number; name: string; unit: string; qty: number; min: number; price: number; exp: number | null; supplier: string };
type Move = { text: string; delta: number; t: string };
type Order = { id: number; supplier: string; lines: { id: number; name: string; qty: number; unit: string }[]; status: "sent" | "received" };

const startItems: Item[] = [
  { id: 1, name: "Гурил 25 кг", unit: "шуудай", qty: 42, min: 15, price: 52000, exp: 120, supplier: "Нийлүүлэгч А" },
  { id: 2, name: "Будаа 5 кг", unit: "уут", qty: 8, min: 10, price: 21000, exp: 200, supplier: "Нийлүүлэгч А" },
  { id: 3, name: "Ургамлын тос 5 л", unit: "лонх", qty: 0, min: 6, price: 38000, exp: 300, supplier: "Нийлүүлэгч Б" },
  { id: 4, name: "Сүү 1 л", unit: "ш", qty: 36, min: 20, price: 3800, exp: 4, supplier: "Нийлүүлэгч В" },
  { id: 5, name: "Шахмал цай", unit: "ш", qty: 14, min: 12, price: 6500, exp: null, supplier: "Нийлүүлэгч Б" },
  { id: 6, name: "Угаалгын нунтаг", unit: "хайрцаг", qty: 5, min: 8, price: 18000, exp: null, supplier: "Нийлүүлэгч Б" },
];

const statusOf = (it: Item): Tone => (it.qty === 0 ? "bad" : it.qty <= it.min ? "warn" : "good");
const statusText: Record<Tone, string> = { good: "Хангалттай", warn: "Дуусах дөхсөн", bad: "Дууссан", info: "" };
const suggest = (it: Item) => it.min * 2 - it.qty; // захиалах санал: доод хэмжээний 2 дахин хүртэл

export default function WarehouseDemo() {
  const [items, setItems] = useState<Item[]>(startItems);
  const [view, setView] = useState<"stock" | "pos" | "order">("stock");
  const [q, setQ] = useState("");
  const [log, setLog] = useState<Move[]>([
    { text: "Сүү 1 л · орлого", delta: 48, t: "08:30" },
    { text: "Гурил 25 кг · борлуулалт", delta: -3, t: "09:40" },
  ]);
  const [clock, setClock] = useState(10 * 60 + 12);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [toast, setToast] = useFlash<string>(3500);

  const now = () => {
    const t = `${String(Math.floor(clock / 60)).padStart(2, "0")}:${String(clock % 60).padStart(2, "0")}`;
    setClock((c) => c + 3);
    return t;
  };
  const change = (id: number, delta: number, why: string) => {
    const it = items.find((x) => x.id === id)!;
    setItems((l) => l.map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x)));
    setLog((l) => [{ text: `${it.name} · ${why}`, delta, t: now() }, ...l].slice(0, 6));
  };

  const low = items.filter((it) => statusOf(it) !== "good");
  const expiring = items.filter((it) => it.exp !== null && it.exp <= 14);
  const pending = new Set(orders.filter((o) => o.status === "sent").flatMap((o) => o.lines.map((l) => l.id)));
  const toOrder = low.filter((it) => !pending.has(it.id));

  /* ----- Касс ----- */
  const cartTotal = Object.entries(cart).reduce((s, [id, n]) => s + items.find((x) => x.id === Number(id))!.price * n, 0);
  const addToCart = (it: Item) => {
    const inCart = cart[it.id] ?? 0;
    if (inCart >= it.qty) return;
    setCart((c) => ({ ...c, [it.id]: inCart + 1 }));
  };
  const sell = () => {
    const t = now();
    const entries = Object.entries(cart);
    setItems((l) => l.map((x) => (cart[x.id] ? { ...x, qty: x.qty - cart[x.id] } : x)));
    setLog((l) => [...entries.map(([id, n]) => ({ text: `${items.find((x) => x.id === Number(id))!.name} · борлуулалт`, delta: -n, t })), ...l].slice(0, 6));
    setRevenue((r) => r + cartTotal);
    setCart({});
    const nowLow = items.filter((x) => cart[x.id] && x.qty - cart[x.id] <= x.min && x.qty > x.min);
    setToast(nowLow.length ? `Борлуулалт амжилттай. «${nowLow[0].name}» дуусах дөхлөө — татан авах жагсаалтад нэмэгдлээ.` : "Борлуулалт амжилттай. Үлдэгдэл шинэчлэгдлээ.");
  };

  /* ----- Татан авах ----- */
  const sendOrders = () => {
    const bySupplier = new Map<string, Order["lines"]>();
    toOrder.forEach((it) => {
      const lines = bySupplier.get(it.supplier) ?? [];
      lines.push({ id: it.id, name: it.name, qty: suggest(it), unit: it.unit });
      bySupplier.set(it.supplier, lines);
    });
    const created: Order[] = Array.from(bySupplier.entries()).map(([supplier, lines], i) => ({ id: Date.now() + i, supplier, lines, status: "sent" }));
    setOrders((o) => [...created, ...o]);
    setToast(`${created.length} нийлүүлэгч рүү захиалга илгээгдлээ`);
  };
  const receive = (o: Order) => {
    const t = now();
    setItems((l) => l.map((x) => {
      const line = o.lines.find((ln) => ln.id === x.id);
      return line ? { ...x, qty: x.qty + line.qty } : x;
    }));
    setLog((l) => [...o.lines.map((ln) => ({ text: `${ln.name} · орлого (${o.supplier})`, delta: ln.qty, t })), ...l].slice(0, 6));
    setOrders((l) => l.map((x) => (x.id === o.id ? { ...x, status: "received" } : x)));
    setToast(`${o.supplier}-аас бараа хүлээн авлаа. Үлдэгдэл нэмэгдлээ.`);
  };

  const shown = items.filter((it) => it.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Frame
      sub="Жишээ: хүнсний бөөний дэлгүүр"
      right={
        <Tabs
          label="Хэсэг"
          value={view}
          onChange={setView}
          options={[
            { v: "stock", label: "Үлдэгдэл" },
            { v: "pos", label: "Касс" },
            { v: "order", label: `Татан авах${toOrder.length ? ` (${toOrder.length})` : ""}` },
          ]}
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Нэр төрөл" value={items.length} />
        <Stat label="Дуусах дөхсөн / дууссан" value={low.length} />
        <Stat label="Хугацаа дуусах (14 хоног)" value={expiring.length} />
        <Stat label="Өнөөдрийн борлуулалт" value={money(revenue)} />
      </div>

      {toast && <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-sky-100">🔔 {toast}</div>}

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {view === "stock" && (
            <Panel>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Бараа хайх…"
                aria-label="Бараа хайх"
                className="mb-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
              />
              <ul className="divide-y divide-white/5">
                {shown.map((it) => {
                  const s = statusOf(it);
                  return (
                    <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                      <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                        <p className="text-sm font-medium text-white">{it.name}</p>
                        <p className="text-xs text-slate-500">
                          Доод хэмжээ {it.min} · {money(it.price)}
                          {it.exp !== null && (
                            <span className={it.exp <= 14 ? " text-amber-300" : ""}> · хугацаа {it.exp} хоног</span>
                          )}
                        </p>
                      </div>
                      <Badge tone={s}>{statusText[s]}</Badge>
                      <div className="ml-auto flex items-center gap-2 sm:ml-0">
                        <button aria-label={`${it.name} зарлага`} className={`${btnGhost} h-8 w-8 px-0`} disabled={it.qty === 0} onClick={() => change(it.id, -1, "зарлага")}>−</button>
                        <span className="w-20 text-center text-sm font-semibold text-white">{it.qty} <span className="text-xs font-normal text-slate-400">{it.unit}</span></span>
                        <button aria-label={`${it.name} орлого`} className={`${btnMain} h-8 w-8 px-0`} onClick={() => change(it.id, 5, "орлого")}>+</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {expiring.length > 0 && (
                <p className="mt-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
                  ⏰ {expiring.map((x) => x.name).join(", ")} — хугацаа удахгүй дуусна. Хямдралаар зарах эсвэл буцаах шийдвэр гаргаарай.
                </p>
              )}
            </Panel>
          )}

          {view === "pos" && (
            <Panel title="Касс — бараа дээр дарж сагсанд нэмнэ">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((it) => (
                  <button
                    key={it.id}
                    disabled={it.qty === 0 || (cart[it.id] ?? 0) >= it.qty}
                    onClick={() => addToCart(it)}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-accent/50 disabled:opacity-40"
                  >
                    <p className="text-sm text-white">{it.name}</p>
                    <p className="text-xs text-slate-400">{money(it.price)} · үлдэгдэл {it.qty - (cart[it.id] ?? 0)}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                {Object.keys(cart).length === 0 ? (
                  <p className="text-sm text-slate-500">Сагс хоосон байна.</p>
                ) : (
                  <ul className="space-y-1 text-sm text-slate-200">
                    {Object.entries(cart).map(([id, n]) => {
                      const it = items.find((x) => x.id === Number(id))!;
                      return (
                        <li key={id} className="flex justify-between">
                          <span>{it.name} × {n}</span>
                          <span>{money(it.price * n)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-semibold text-white">Нийт: {money(cartTotal)}</span>
                  <div className="flex gap-2">
                    <button className={btnGhost} disabled={!cartTotal} onClick={() => setCart({})}>Цэвэрлэх</button>
                    <button className={btnMain} disabled={!cartTotal} onClick={sell}>Борлуулах</button>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {view === "order" && (
            <Panel title="Татан авах жагсаалт (систем өөрөө бэлдэнэ)">
              {toOrder.length === 0 ? (
                <p className="text-sm text-slate-500">Одоогоор захиалах шаардлагатай бараа алга.</p>
              ) : (
                <>
                  <ul className="divide-y divide-white/5">
                    {toOrder.map((it) => (
                      <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <span className="text-white">{it.name} <span className="text-xs text-slate-500">· {it.supplier}</span></span>
                        <span className="text-slate-300">үлдэгдэл {it.qty} → <b className="text-white">+{suggest(it)} {it.unit}</b></span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">Санал болгох тоо = доод хэмжээний 2 дахин хүртэл нөхөх</p>
                    <button className={btnMain} onClick={sendOrders}>Нийлүүлэгч рүү илгээх</button>
                  </div>
                </>
              )}
              {orders.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Илгээсэн захиалга</p>
                  {orders.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                      <div>
                        <p className="text-white">{o.supplier}</p>
                        <p className="text-xs text-slate-400">{o.lines.map((l) => `${l.name} +${l.qty}`).join(", ")}</p>
                      </div>
                      {o.status === "sent" ? (
                        <button className={btnGhost} onClick={() => receive(o)}>Хүлээн авах</button>
                      ) : (
                        <Badge tone="good">Хүлээн авсан</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>

        <Panel title="Сүүлийн хөдөлгөөн">
          <ul className="space-y-3">
            {log.map((m, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="text-slate-200">{m.text}</p>
                  <p className="text-xs text-slate-500">{m.t}</p>
                </div>
                <span className={`font-semibold ${m.delta > 0 ? "text-emerald-300" : "text-slate-300"}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">Касс, орлого, зарлага бүр энд бүртгэгдэж, хэн хэзээ юу хийснийг хадгална.</p>
        </Panel>
      </div>
    </Frame>
  );
}
