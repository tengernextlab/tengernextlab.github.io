import { company, nav } from "@/lib/content";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Logo size={24} />
          {company.name}
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-slate-400">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-4 text-sm text-slate-400">
          {company.socials.map((s) => (
            <a key={s.name} href={s.href} className="hover:text-white">
              {s.name}
            </a>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {company.name}. Бүх эрх хуулиар хамгаалагдсан.
      </p>
    </footer>
  );
}
