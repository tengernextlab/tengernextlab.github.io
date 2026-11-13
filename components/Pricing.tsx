import { base, company, extraServices, pricing } from "@/lib/content";
import SectionTitle from "./SectionTitle";

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0 text-accent">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-sky-night/50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Үнэ"
          title="Вэб сайтын багцууд"
          subtitle="Эцсийн үнэ хуудасны тоо, хэл, нэмэлт боломжоос хамаарна. Ярилцсаны дараа тодорхой үнийн санал бичгээр өгнө."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pricing.map((p) => {
            const popular = "popular" in p && p.popular;
            return (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  popular ? "border-accent/60 bg-accent/10" : "border-white/10 bg-white/5"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-sky-deep">
                    Их сонгогддог
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{p.for}</p>
                <p className="mt-5 text-2xl font-bold text-white">
                  {p.price ? (
                    <>
                      {p.price}
                      <span className="text-sm font-normal text-slate-400">-өөс эхэлнэ</span>
                    </>
                  ) : (
                    <span className="text-xl">Үнийн санал авах</span>
                  )}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-slate-300">
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`${base}/#contact`}
                  className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-medium ${
                    popular ? "bg-accent text-sky-deep hover:bg-sky-300" : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  Энэ багцыг сонгох
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <h3 className="text-center text-xl font-semibold text-white">Жижиг, нэмэлт үйлчилгээ</h3>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">
            Вэб сайтгүй ч эхэлж болно. Эдгээрийг тусад нь эсвэл багцтай хамт авч болно.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {extraServices.map((x) => (
              <div key={x.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h4 className="font-semibold text-white">{x.title}</h4>
                <p className="mt-2 text-sm text-slate-400">{x.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            Асуух зүйл байвал{" "}
            <a href={company.messenger} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Messenger-ээр бичих
            </a>{" "}
            эсвэл{" "}
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="text-accent hover:underline">
              {company.phone}
            </a>{" "}
            дугаарт залгаарай.
          </p>
        </div>
      </div>
    </section>
  );
}
