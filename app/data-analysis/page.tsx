import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import DemoDashboard from "@/components/DemoDashboard";
import { base, company } from "@/lib/content";
import { allServiceLinks } from "@/lib/servicePages";
import {
  daHero,
  daQuestions,
  daBeforeAfter,
  daSteps,
  daDeliverables,
  daPackages,
  daFaq,
} from "@/lib/dataAnalysis";

export const metadata: Metadata = {
  title: "Мэдээллийн шинжилгээ (Data analysis) — TengerNextLab",
  description:
    "Борлуулалт, зардал, агуулахын мэдээллийг тань ойлгомжтой самбар (dashboard), тайлан болгоно. Excel, кассын программ, дэвтэр — байгаа өгөгдлөөсөө эхэлнэ.",
  openGraph: {
    title: "Мэдээллийн шинжилгээ — TengerNextLab",
    description: "Excel дээр хуримтлагдсан тоог ашигтай шийдвэр болгоно. Жишээ самбарыг туршаад үзээрэй.",
    type: "website",
  },
};

const mailto = `mailto:${company.email}?subject=${encodeURIComponent("Мэдээллийн шинжилгээний талаар")}&body=${encodeURIComponent(
  "Сайн байна уу,\n\nБизнесийн төрөл:\nМанайд байгаа өгөгдөл (Excel, кассын программ г.м.):\nМэдэхийг хүсэж буй зүйл:\n"
)}`;
const tel = `tel:${company.phone.replace(/\s/g, "")}`;

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0 text-accent">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export default function DataAnalysisPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
          <div className="stars absolute inset-0 opacity-60" aria-hidden />
          <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 text-center">
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs text-slate-300">
              {daHero.eyebrow}
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              {daHero.title[0]} <span className="text-gradient">{daHero.title[1]}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">{daHero.text}</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#demo" className="rounded-full bg-accent px-6 py-3 font-medium text-sky-deep hover:bg-sky-300">
                Жишээ самбар үзэх
              </a>
              <a href={tel} className="rounded-full border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5">
                Залгах: {company.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Жишээ самбар */}
        <section id="demo" className="scroll-mt-20 pb-24">
          <div className="mx-auto max-w-6xl px-4">
            <DemoDashboard />
            <p className="mt-3 text-center text-xs text-slate-500">
              Энэ бол зохиомол өгөгдөл дээрх жишээ. Танай самбарт өөрийн чинь бизнест хэрэгтэй үзүүлэлтүүд орно.
            </p>
          </div>
        </section>

        {/* Ямар асуултад хариулах */}
        <section className="bg-sky-night/50 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Ямар ашигтай вэ"
              title="Таны тоо эдгээр асуултад хариулна"
              subtitle="Өгөгдөл бол танай бизнесийн түүх. Бид түүнийг уншиж, ойлгомжтой хариулт болгоно."
            />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {daQuestions.map((x) => (
                <div key={x.q} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="font-semibold text-white">{x.q}</h3>
                  <p className="mt-2 text-sm text-slate-400">{x.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Өмнө / дараа */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-4">
            <SectionTitle eyebrow="Өөрчлөлт" title="Шинжилгээний өмнө ба дараа" />
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Одоо</p>
                <ul className="mt-4 space-y-3">
                  {daBeforeAfter.before.map((t) => (
                    <li key={t} className="flex gap-3 text-slate-400">
                      <span aria-hidden className="mt-0.5 shrink-0 text-slate-500">✕</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">Дараа нь</p>
                <ul className="mt-4 space-y-3">
                  {daBeforeAfter.after.map((t) => (
                    <li key={t} className="flex gap-3 text-slate-200">
                      <Check />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ажлын явц */}
        <section className="bg-sky-night/50 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Ажлын явц"
              title="4 алхамд хийгдэнэ"
              subtitle="Хугацаа нь жижиг бизнесийн хувьд ойролцоо тооцоо. Өгөгдөл хэр цэгцтэй байгаагаас хамаарна."
            />
            <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {daSteps.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-sky-deep">{i + 1}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{s.time}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{s.text}</p>
                </li>
              ))}
            </ol>

            <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white">Та юу авах вэ</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {daDeliverables.map((d) => (
                  <li key={d} className="flex gap-3 text-sm text-slate-300">
                    <Check />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Ажлын хэлбэр */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle eyebrow="Ажлын хэлбэр" title="Танд тохирохыг сонгоорой" />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {daPackages.map((p) => (
                <div
                  key={p.name}
                  className={`flex flex-col rounded-2xl border p-6 ${
                    "featured" in p && p.featured ? "border-accent/60 bg-accent/5" : "border-white/10 bg-white/5"
                  }`}
                >
                  {"featured" in p && p.featured && (
                    <span className="mb-3 self-start rounded-full bg-accent px-3 py-1 text-xs font-medium text-sky-deep">Ихэнх бизнест тохиромжтой</span>
                  )}
                  <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{p.for}</p>
                  <ul className="mt-5 flex-1 space-y-3">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-3 text-sm text-slate-300">
                        <Check />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-white/10 pt-4 text-sm font-medium text-white">{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-sky-night/50 py-24">
          <div className="mx-auto max-w-3xl px-4">
            <SectionTitle eyebrow="Түгээмэл асуулт" title="Асуулт, хариулт" />
            <div className="mt-12 space-y-3">
              {daFaq.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/5 p-5 open:border-accent/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                    {f.q}
                    <span aria-hidden className="text-accent transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 to-accent-2/15 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-bold text-white">Өгөгдлөө юу хэлж байгааг мэдмээр байна уу?</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                Бизнесийнхээ тухай товч хэлээд, ямар өгөгдөл байгаагаа бичээрэй. Юунаас эхлэхийг хамтдаа шийдье.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={mailto} className="rounded-full bg-accent px-6 py-3 font-medium text-sky-deep hover:bg-sky-300">
                  Имэйл бичих
                </a>
                <a href={tel} className="rounded-full border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5">
                  {company.phone}
                </a>
              </div>
            </div>

            {/* Бусад үйлчилгээ */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-400">Бусад үйлчилгээ</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {allServiceLinks
                  .filter((s) => s.href !== "/data-analysis/")
                  .map((s) => (
                    <a key={s.href} href={`${base}${s.href}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:border-accent/50 hover:text-white">
                      {s.name}
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
