"use client";

import { FormEvent } from "react";
import { company } from "@/lib/content";
import { allServiceLinks } from "@/lib/servicePages";
import SectionTitle from "./SectionTitle";

export default function Contact() {
  // Имэйл програмыг бөглөсөн мэдээлэлтэй нь нээнэ. Backend холбохдоо энэ функцийг сольж болно.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `Вэб сайтаас: ${data.get("name")} — ${data.get("service")}`;
    const body = `Нэр: ${data.get("name")}\nУтас / имэйл: ${data.get("contact")}\nСонирхож буй үйлчилгээ: ${data.get("service")}\n\n${data.get("message")}`;
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const input =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none";

  const cards = [
    { label: "Утас", value: company.phone, href: `tel:${company.phone.replace(/\s/g, "")}` },
    { label: "Имэйл", value: company.email, href: `mailto:${company.email}` },
    { label: "Хаяг", value: company.address },
    { label: "Үйлчлэх бүс", value: company.area },
  ];

  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Холбоо барих"
          title="Үнийн санал авах"
          subtitle="Бизнесийнхээ тухай, юу хэрэгтэй байгаагаа товч бичээрэй. 1 ажлын өдөрт багтаан хариу өгнө."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {cards.map((c) => (
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
              <input name="name" required placeholder="Таны нэр, байгууллага" aria-label="Таны нэр, байгууллага" className={input} />
              <input name="contact" required placeholder="Утас эсвэл имэйл" aria-label="Утас эсвэл имэйл" className={input} />
            </div>
            <select name="service" aria-label="Сонирхож буй үйлчилгээ" className={input} defaultValue="Тодорхойгүй / зөвлөгөө авах">
              {allServiceLinks.map((s) => (
                <option key={s.href} className="bg-sky-deep">{s.name}</option>
              ))}
              <option className="bg-sky-deep">Тодорхойгүй / зөвлөгөө авах</option>
            </select>
            <textarea name="message" required rows={5} placeholder="Юу хийлгэхийг хүсэж байна вэ? (жишээ нь: 15 ажилтантай дэлгүүрт цаг бүртгэл хэрэгтэй)" aria-label="Мессеж" className={input} />
            <button type="submit" className="rounded-full bg-accent px-6 py-3 font-medium text-sky-deep hover:bg-sky-300">
              Илгээх
            </button>
            <p className="text-xs text-slate-500">«Илгээх» дарахад таны имэйл програм бөглөгдсөн захидалтай нээгдэнэ. Эсвэл шууд {company.phone} дугаарт залгаарай.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
