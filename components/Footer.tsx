import { base, company } from "@/lib/content";
import { allServiceLinks } from "@/lib/servicePages";
import Logo from "./Logo";
import ChatButtons from "./ChatButtons";

export default function Footer() {
  const socials = company.socials.filter((s) => s.href && s.href !== "#");
  const tel = `tel:${company.phone.replace(/\s/g, "")}`;
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <a href={`${base}/`} className="flex items-center gap-2 font-semibold text-white">
            <Logo size={24} />
            {company.name}
          </a>
          <p className="mt-3 max-w-xs text-sm text-slate-400">{company.tagline}</p>
          <p className="mt-2 text-sm text-slate-500">{company.area}</p>
        </div>

        <nav aria-label="Үйлчилгээ">
          <p className="text-sm font-semibold text-white">Үйлчилгээ</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {allServiceLinks.map((s) => (
              <li key={s.href}>
                <a href={`${base}${s.href}`} className="hover:text-white">{s.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-white">Холбоо барих</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><a href={tel} className="hover:text-white">📞 {company.phone}</a></li>
            <li><a href={`mailto:${company.email}`} className="hover:text-white">✉️ {company.email}</a></li>
            {socials.map((s) => (
              <li key={s.name}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">{s.name}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {company.legalName}. Бүх эрх хуулиар хамгаалагдсан.
      </p>
      <ChatButtons />
    </footer>
  );
}
