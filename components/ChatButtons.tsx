import { company } from "@/lib/content";

// Дэлгэцийн баруун доод буланд байнга харагдах Messenger, утасны товч
export default function ChatButtons() {
  const tel = `tel:${company.phone.replace(/\s/g, "")}`;
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <a
        href={tel}
        aria-label={`Залгах: ${company.phone}`}
        title={`Залгах: ${company.phone}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-black/40 transition hover:scale-105"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
        </svg>
      </a>
      <a
        href={company.messenger}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Messenger-ээр бичих"
        title="Messenger-ээр бичих"
        className="flex h-14 items-center gap-2 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 pl-4 pr-5 font-medium text-white shadow-lg shadow-black/40 transition hover:scale-105"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.99-.88a.8.8 0 0 1 .53-.04c.91.25 1.88.39 2.9.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6 7.46-2.93 4.66a1.5 1.5 0 0 1-2.17.4l-2.33-1.75a.6.6 0 0 0-.72 0l-3.15 2.4c-.42.32-.97-.18-.69-.63l2.93-4.66a1.5 1.5 0 0 1 2.17-.4l2.33 1.75a.6.6 0 0 0 .72 0l3.15-2.4c.42-.32.97.18.69.63z" />
        </svg>
        <span className="hidden sm:inline">Бидэнд бичих</span>
      </a>
    </div>
  );
}
