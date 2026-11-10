"use client";

import { FormEvent } from "react";
import { company } from "@/lib/content";
import SectionTitle from "./SectionTitle";

export default function Contact() {
  // Одоогоор имэйл програмыг нээнэ. Backend холбохдоо энэ функцийг сольж болно.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `Вэб сайтаас: ${data.get("name")}`;
    const body = `Нэр: ${data.get("name")}\nИмэйл: ${data.get("email")}\n\n${data.get("message")}`;
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const input =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none";

  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Холбоо барих"
          title="Хамтдаа бүтээе"
          subtitle="Төслийнхөө санааг бидэнтэй хуваалцаарай. Бид 1 ажлын өдөрт багтаан хариу өгнө."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {[
              { label: "Имэйл", value: company.email, href: `mailto:${company.email}` },
              { label: "Утас", value: company.phone, href: `tel:${company.phone.replace(/\s/g, "")}` },
              { label: "Хаяг", value: company.address },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="mt-1 block font-medium text-white hover:text-accent">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 font-medium text-white">{c.value}</p>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required placeholder="Таны нэр" className={input} />
              <input name="email" type="email" required placeholder="Имэйл хаяг" className={input} />
            </div>
            <textarea name="message" required rows={6} placeholder="Мессеж" className={input} />
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 font-medium text-sky-deep hover:bg-sky-300"
            >
              Илгээх
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
