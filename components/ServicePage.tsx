// Үйлчилгээний дэлгэрэнгүй хуудасны нийтлэг загвар (app/[slug]/page.tsx ашиглана)
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import AttendanceDemo from "@/components/demo/AttendanceDemo";
import WarehouseDemo from "@/components/demo/WarehouseDemo";
import HRDemo from "@/components/demo/HRDemo";
import WebsiteDemo from "@/components/demo/WebsiteDemo";
import MobileAppDemo from "@/components/MobileAppDemo";
import { base, company } from "@/lib/content";
import { allServiceLinks, type ServicePageContent } from "@/lib/servicePages";

const demos: Record<string, () => React.ReactNode> = {
  attendance: AttendanceDemo,
  warehouse: WarehouseDemo,
  hr: HRDemo,
  website: WebsiteDemo,
  "mobile-app": MobileAppDemo,
};

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0 text-accent">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export default function ServicePage({ page }: { page: ServicePageContent }) {
  const Demo = demos[page.slug];
  const tel = `tel:${company.phone.replace(/\s/g, "")}`;
  const mailto = `mailto:${company.email}?subject=${encodeURIComponent(page.name + "-ийн талаар")}&body=${encodeURIComponent(
    "Сайн байна уу,\n\nБайгууллагын нэр, төрөл:\nАжилтны тоо:\nХэрэгцээ:\n"
  )}`;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
          <div className="stars absolute inset-0 opacity-60" aria-hidden />
          <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 text-center">
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs text-slate-300">{page.eyebrow}</span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              {page.title[0]} <span className="text-gradient">{page.title[1]}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">{page.text}</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#demo" className="rounded-full bg-accent px-6 py-3 font-medium text-sky-deep hover:bg-sky-300">
                Жишээ туршиж үзэх
              </a>
              <a href={tel} className="rounded-full border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5">
                Залгах: {company.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Жишээ */}
        <section id="demo" className="scroll-mt-20 pb-24">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-4 text-center text-xl font-semibold text-white">{page.demoTitle}</h2>
            {Demo && <Demo />}
            <p className="mt-3 text-center text-xs text-slate-500">{page.demoNote}</p>
          </div>
        </section>

        {/* Давуу тал */}
        <section className="bg-sky-night/50 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle eyebrow="Ямар ашигтай вэ" title={page.benefitsTitle} />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.benefits.map((x) => (
                <div key={x.q} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="font-semibold text-white">{x.q}</h3>
                  <p className="mt-2 text-sm text-slate-400">{x.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ажлын явц */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle
              eyebrow="Ажлын явц"
              title="4 алхамд хийгдэнэ"
              subtitle="Хугацаа нь ойролцоо тооцоо. Байгууллагын хэмжээ, шаардлагаас хамаарна."
            />
            <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {page.steps.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between gap-2">
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
                {page.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 text-sm text-slate-300">
                    <Check />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-sky-night/50 py-24">
          <div className="mx-auto max-w-3xl px-4">
            <SectionTitle eyebrow="Түгээмэл асуулт" title="Асуулт, хариулт" />
            <div className="mt-12 space-y-3">
              {page.faq.map((f) => (
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
              <h2 className="text-3xl font-bold text-white">{page.cta}</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">Байгууллагынхаа тухай товч бичээрэй. Юунаас эхлэхийг хамтдаа шийдье.</p>
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
                  .filter((s) => s.href !== `/${page.slug}/`)
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
