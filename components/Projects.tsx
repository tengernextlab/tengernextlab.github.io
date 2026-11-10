import { projects } from "@/lib/content";
import SectionTitle from "./SectionTitle";

const gradients = [
  "from-sky-500/40 to-indigo-600/40",
  "from-indigo-500/40 to-fuchsia-500/40",
  "from-cyan-400/40 to-sky-700/40",
];

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 bg-sky-night/50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="Төслүүд" title="Хэрэгжүүлсэн ажлууд" />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {projects.map((p, i) => (
            <article key={p.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className={`h-40 bg-gradient-to-br ${gradients[i % gradients.length]}`} />
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-accent">{p.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-slate-400">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
