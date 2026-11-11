import { company, stats } from "@/lib/content";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="stars absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute left-1/2 top-0 -z-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-2/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs text-slate-300">
          {company.tagline}
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-6xl">
          {company.headline[0]} <span className="text-gradient">{company.headline[1]}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">{company.description}</p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#services"
            className="rounded-full bg-accent px-6 py-3 font-medium text-sky-deep hover:bg-sky-300"
          >
            Үйлчилгээ, жишээ үзэх
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5"
          >
            Үнийн санал авах
          </a>
        </div>

        <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <dt className="text-sm text-slate-400">{s.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-white sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
