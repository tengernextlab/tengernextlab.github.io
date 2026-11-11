import { industries } from "@/lib/content";
import SectionTitle from "./SectionTitle";

const icons: Record<string, React.ReactNode> = {
  hospital: <path d="M4 21V7l8-4 8 4v14zM12 9v6M9 12h6M9 21v-3h6v3" />,
  pill: <path d="M10.5 4.5a5 5 0 0 1 7 7l-6 6a5 5 0 0 1-7-7zM7.5 9.5l7 7" />,
  hotel: <path d="M3 20V6M3 13h18v7M21 13a4 4 0 0 0-4-4h-6v4M7 11a2 2 0 1 0 0-.01" />,
  tour: <path d="M3 20l6-12 4 7 2-3 6 8zM16 7a2 2 0 1 0 0-.01" />,
  school: <path d="M2 9l10-5 10 5-10 5zM6 11v5c0 2 3 3 6 3s6-1 6-3v-5M22 9v6" />,
  kinder: <path d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 22l2-9h10l2 9M9 13l-3-3M15 13l3-3" />,
  shop: <path d="M4 9l1-5h14l1 5M4 9h16v11H4zM4 9a3 3 0 0 0 5 0 3 3 0 0 0 6 0 3 3 0 0 0 5 0M10 20v-5h4v5" />,
  cafe: <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 2v3M12 2v3" />,
  car: <path d="M5 16l1.5-5h11L19 16M3 16h18v3H3zM7 19v2M17 19v2M8 7c0-2 1-3 1-3M12 7c0-2 1-3 1-3M16 7c0-2 1-3 1-3" />,
  beauty: <path d="M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8.5 7.5L20 18M8.5 16.5L20 6" />,
  gym: <path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12" />,
  factory: <path d="M3 21V10l6 4V10l6 4V5h6v16zM7 18h2M12 18h2M17 18h2" />,
};

export default function Industries() {
  return (
    <section id="industries" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Салбарууд"
          title="Танай салбарт тохирсон систем"
          subtitle="Доорх салбаруудад зориулж бэлэн шийдэл санал болгоно. Танай байгууллага жагсаалтад байхгүй бол бидэнтэй холбогдоорой — хэрэгцээнд тань тааруулж шинээр хийж өгнө."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-accent/50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icons[item.icon]}
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
