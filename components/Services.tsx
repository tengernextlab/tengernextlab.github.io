import { base, services } from "@/lib/content";
import SectionTitle from "./SectionTitle";

const icons: Record<string, React.ReactNode> = {
  web: <path d="M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01" />,
  mobile: <path d="M7 3h10v18H7zM11 18h2" />,
  ai: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M7 7h10v10H7zM10 10h4v4h-4z" />,
  cloud: <path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z" />,
  design: <path d="M12 3l9 9-9 9-9-9zM12 8v8M8 12h8" />,
  consult: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5" />,
  data: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6M20 16v-9" />,
  clock: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2" />,
  warehouse: <path d="M3 9l9-5 9 5v11H3zM7 20v-6h10v6M7 17h10" />,
  people: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6" />,
};

export default function Services() {
  return (
    <section id="services" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Үйлчилгээ"
          title="Бидний санал болгох шийдлүүд"
          subtitle="Өдөр тутмын ажлыг тань хялбар, хурдан болгох программууд. Техникийн мэдлэг шаардахгүй — бид суулгаж, ашиглахыг нь зааж өгнө."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-accent/50"
            >
              {"image" in s && (
                <div className="-mx-2 -mt-2 mb-5 overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${s.image}`}
                    alt={s.title}
                    className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icons[s.icon]}
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-slate-400">{s.text}</p>
              {"href" in s && (
                <a
                  href={`${base}${s.href}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-sky-300"
                >
                  Дэлгэрэнгүй, жишээ самбар үзэх <span aria-hidden>→</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
