"use client";

// Хүний нөөцийн жишээ: ажилтны утаснаас чөлөөний хүсэлт → менежер зөвшөөрөх → ажилтанд мэдэгдэл.
// Ажилтны хувийн хэрэг, гэрээ дуусах сануулга. Бүх нэр, тоо зохиомол.

import { useState } from "react";
import { Badge, Frame, Panel, Phone, btnGhost, btnMain, useFlash } from "./ui";

type Person = { id: number; name: string; dept: string; pos: string; since: string; contractDays: number; leaveLeft: number };
type ReqType = "Ээлжийн амралт" | "Чөлөө" | "Өвчний чөлөө";
type Req = { id: number; pid: number; type: ReqType; start: string; days: number; status: "pending" | "ok" | "no" };

const ME = 4; // утсан дээрх ажилтан: Т. Айгерим
const dates = ["11.17 Да", "11.18 Мя", "11.19 Лх", "11.20 Пү", "11.21 Ба"];

export default function HRDemo() {
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Б. Болд", dept: "Борлуулалт", pos: "Кассчин", since: "2022.03", contractDays: 210, leaveLeft: 9 },
    { id: 2, name: "Г. Сараа", dept: "Санхүү", pos: "Нягтлан бодогч", since: "2020.09", contractDays: 38, leaveLeft: 15 },
    { id: 3, name: "А. Ерлан", dept: "Тээвэр", pos: "Жолооч", since: "2023.05", contractDays: 320, leaveLeft: 6 },
    { id: 4, name: "Т. Айгерим", dept: "Борлуулалт", pos: "Борлуулагч", since: "2024.01", contractDays: 12, leaveLeft: 11 },
    { id: 5, name: "Д. Тэмүүлэн", dept: "Агуулах", pos: "Нярав", since: "2021.11", contractDays: 150, leaveLeft: 4 },
  ]);
  const [reqs, setReqs] = useState<Req[]>([
    { id: 1, pid: 1, type: "Ээлжийн амралт", start: "12.02", days: 5, status: "pending" },
    { id: 2, pid: 5, type: "Чөлөө", start: "11.20", days: 1, status: "pending" },
  ]);
  const [sel, setSel] = useState(2);
  const [screen, setScreen] = useState<"home" | "form" | "sent">("home");
  const [rType, setRType] = useState<ReqType>("Ээлжийн амралт");
  const [start, setStart] = useState(dates[0]);
  const [days, setDays] = useState(2);
  const [flash, setFlash] = useFlash<number>(4000);
  const [toast, setToast] = useFlash<string>(3500);

  const me = people.find((p) => p.id === ME)!;
  const p = people.find((x) => x.id === sel)!;
  const myReqs = reqs.filter((r) => r.pid === ME);
  const maxDays = rType === "Ээлжийн амралт" ? Math.min(5, me.leaveLeft) : 5;

  const submit = () => {
    const r: Req = { id: Date.now(), pid: ME, type: rType, start: start.split(" ")[0], days: Math.min(days, maxDays), status: "pending" };
    setReqs((l) => [r, ...l]);
    setFlash(r.id);
    setScreen("sent");
  };

  const decide = (r: Req, ok: boolean) => {
    setReqs((l) => l.map((x) => (x.id === r.id ? { ...x, status: ok ? "ok" : "no" } : x)));
    if (ok && r.type === "Ээлжийн амралт") setPeople((l) => l.map((x) => (x.id === r.pid ? { ...x, leaveLeft: Math.max(0, x.leaveLeft - r.days) } : x)));
    if (r.pid === ME) setToast(ok ? `Таны ${r.type.toLowerCase()} (${r.start}, ${r.days} хоног) зөвшөөрөгдлөө ✓` : `Таны хүсэлтээс татгалзлаа. Менежертэйгээ ярина уу.`);
  };

  const statusBadge = (s: Req["status"]) =>
    s === "pending" ? <Badge tone="warn">Хүлээгдэж буй</Badge> : s === "ok" ? <Badge tone="good">Зөвшөөрсөн</Badge> : <Badge tone="bad">Татгалзсан</Badge>;
  const lightStatus = (s: Req["status"]) =>
    s === "pending" ? "bg-amber-100 text-amber-700" : s === "ok" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
  const statusLabel = { pending: "Хүлээгдэж буй", ok: "Зөвшөөрсөн", no: "Татгалзсан" };

  /* ----- Ажилтны утас ----- */
  let phone: React.ReactNode;
  if (screen === "home") {
    phone = (
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-slate-500">Сайн байна уу,</p>
        <p className="text-lg font-bold">Айгерим 👋</p>
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-white">
          <p className="text-xs opacity-80">Ээлжийн амралтын үлдэгдэл</p>
          <p className="text-3xl font-bold">{me.leaveLeft} <span className="text-base font-medium">хоног</span></p>
        </div>
        {me.contractDays <= 60 && (
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">📄 Таны гэрээ {me.contractDays} хоногийн дараа дуусна. Хүний нөөцтэй холбогдоно уу.</p>
        )}
        <p className="mt-4 text-sm font-semibold">Миний хүсэлтүүд</p>
        <div className="mt-2 space-y-2">
          {myReqs.length === 0 && <p className="text-xs text-slate-400">Одоогоор хүсэлт алга.</p>}
          {myReqs.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl bg-white p-3 text-xs ring-1 ring-slate-200">
              <span>{r.type}<br /><span className="text-slate-400">{r.start} · {r.days} хоног</span></span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lightStatus(r.status)}`}>{statusLabel[r.status]}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setScreen("form")} className="mt-auto w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white">+ Чөлөө, амралт хүсэх</button>
      </div>
    );
  } else if (screen === "form") {
    phone = (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
          <button onClick={() => setScreen("home")} className="text-lg leading-none text-sky-600" aria-label="Буцах">‹</button>
          <p className="font-semibold">Шинэ хүсэлт</p>
        </div>
        <div className="flex flex-1 flex-col p-4 text-sm">
          <p className="font-semibold">Төрөл</p>
          <div className="mt-2 space-y-2">
            {(["Ээлжийн амралт", "Чөлөө", "Өвчний чөлөө"] as ReqType[]).map((t) => (
              <button key={t} onClick={() => setRType(t)} className={`w-full rounded-xl p-2.5 text-left text-xs ${rType === t ? "bg-sky-50 ring-2 ring-sky-500" : "bg-white ring-1 ring-slate-200"}`}>{t}</button>
            ))}
          </div>
          <p className="mt-4 font-semibold">Эхлэх өдөр</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {dates.map((d) => (
              <button key={d} onClick={() => setStart(d)} className={`rounded-lg py-1.5 text-[11px] ${start === d ? "bg-sky-500 text-white" : "bg-white ring-1 ring-slate-200"}`}>{d}</button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-semibold">Хэдэн хоног</span>
            <span className="flex items-center gap-3">
              <button onClick={() => setDays((d) => Math.max(1, d - 1))} className="h-8 w-8 rounded-full bg-white ring-1 ring-slate-200" aria-label="Хасах">−</button>
              <b>{Math.min(days, maxDays)}</b>
              <button onClick={() => setDays((d) => Math.min(maxDays, d + 1))} className="h-8 w-8 rounded-full bg-white ring-1 ring-slate-200" aria-label="Нэмэх">+</button>
            </span>
          </div>
          {rType === "Ээлжийн амралт" && <p className="mt-1 text-[11px] text-slate-400">Үлдэгдэл {me.leaveLeft} хоног</p>}
          <button disabled={maxDays < 1} onClick={submit} className="mt-auto w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white disabled:bg-slate-300">Илгээх</button>
        </div>
      </div>
    );
  } else {
    phone = (
      <div className="flex flex-1 flex-col p-4 text-center">
        <div className="mt-10 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl">📨</div>
          <p className="mt-4 text-lg font-bold">Хүсэлт илгээгдлээ</p>
          <p className="mt-1 text-sm text-slate-500">Менежер шийдвэрлэмэгц мэдэгдэл ирнэ.</p>
          <p className="mt-6 rounded-2xl bg-sky-50 p-3 text-xs text-sky-800">👉 Баруун талын самбар дээр «Зөвшөөрөх» дарж үзээрэй.</p>
        </div>
        <button onClick={() => setScreen("home")} className="mt-auto w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white">Нүүр</button>
      </div>
    );
  }

  const expiring = people.filter((x) => x.contractDays <= 60);

  return (
    <Frame sub="Зүүн талд ажилтны утас, баруун талд хүний нөөцийн самбар. Хоёулаа хоорондоо холбоотой.">
      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <Phone label="Ажилтны утас (Т. Айгерим)" time="10:05" toast={toast} toastTitle="Хүний нөөц">
          {phone}
        </Phone>

        <div className="space-y-3">
          <p className="text-center text-xs font-medium text-slate-400 lg:text-left">💻 Хүний нөөцийн самбар</p>

          {expiring.length > 0 && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
              📄 Гэрээ дуусах дөхсөн: {expiring.map((x) => `${x.name} (${x.contractDays} хоног)`).join(", ")}
            </div>
          )}

          <Panel title="Чөлөө, амралтын хүсэлт">
            <ul className="space-y-2">
              {reqs.map((r) => {
                const who = people.find((x) => x.id === r.pid)!;
                return (
                  <li key={r.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition ${flash === r.id ? "border-accent bg-accent/15 ring-2 ring-accent/60" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                      <p className="text-sm text-white">
                        {who.name} · {r.type} {flash === r.id && <span className="ml-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-sky-deep">ШИНЭ</span>}
                      </p>
                      <p className="text-xs text-slate-500">{r.start}-с {r.days} хоног · амралтын үлдэгдэл {who.leaveLeft} хоног</p>
                    </div>
                    {r.status === "pending" ? (
                      <div className="ml-auto flex gap-2 sm:ml-0">
                        <button className={btnGhost} onClick={() => decide(r, false)}>Татгалзах</button>
                        <button className={btnMain} onClick={() => decide(r, true)}>Зөвшөөрөх</button>
                      </div>
                    ) : (
                      statusBadge(r.status)
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <div className="grid gap-3 md:grid-cols-5">
            <Panel title="Ажилтнууд" className="md:col-span-2">
              <ul className="space-y-1">
                {people.map((x) => (
                  <li key={x.id}>
                    <button onClick={() => setSel(x.id)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${sel === x.id ? "bg-accent/10 ring-1 ring-accent/40" : "hover:bg-white/5"}`}>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{x.name.split(" ")[1][0]}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-white">{x.name}</span>
                        <span className="block text-xs text-slate-400">{x.pos}</span>
                      </span>
                      {x.contractDays <= 60 && <span className="h-2 w-2 rounded-full bg-amber-400" aria-label="Гэрээ дуусах дөхсөн" />}
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Хувийн хэрэг" className="md:col-span-3">
              <p className="text-lg font-semibold text-white">{p.name}</p>
              <p className="text-sm text-slate-400">{p.pos} · {p.dept}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Ажилд орсон</dt><dd className="font-medium text-white">{p.since}</dd></div>
                <div className="rounded-xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Амралтын үлдэгдэл</dt><dd className="font-medium text-white">{p.leaveLeft} хоног</dd></div>
                <div className="col-span-2 rounded-xl bg-white/5 p-3">
                  <dt className="text-xs text-slate-400">Гэрээ дуусахад</dt>
                  <dd className="mt-1">{p.contractDays <= 60 ? <Badge tone="warn">{p.contractDays} хоног</Badge> : <Badge tone="good">{p.contractDays} хоног</Badge>}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                {["Анкет", "Хөдөлмөрийн гэрээ", "Томилгооны тушаал", "Үнэлгээ 2025"].map((d) => (
                  <span key={d} className="rounded-lg border border-white/10 px-2.5 py-1">📄 {d}</span>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </Frame>
  );
}
