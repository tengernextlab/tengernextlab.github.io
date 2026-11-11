import { workSteps } from "@/lib/content";
import SectionTitle from "./SectionTitle";

// Нүүр хуудасны «Хэрхэн ажилладаг вэ» хэсэг
export default function HowWeWork() {
  return (
    <section id="process" className="scroll-mt-20 bg-sky-night/50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Хэрхэн ажилладаг вэ"
          title="Энгийн, ойлгомжтой 4 алхам"
          subtitle="Эхний ярилцлагаас эхлээд хүлээлгэж өгөх хүртэл юу болохыг та урьдчилан мэдэж байна."
        />
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {workSteps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-sky-deep">{i + 1}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
