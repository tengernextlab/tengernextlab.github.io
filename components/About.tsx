import { about } from "@/lib/content";
import SectionTitle from "./SectionTitle";

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-sky-night/50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="TengerNextLab" title={about.title} />

        <div className="mx-auto mt-8 max-w-3xl space-y-4 text-center text-slate-300">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {about.values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">{v.title}</h3>
              <p className="mt-2 text-slate-400">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
