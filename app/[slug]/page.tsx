import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePage from "@/components/ServicePage";
import { servicePages } from "@/lib/servicePages";

// /attendance/, /warehouse/, /hr/, /website/, /mobile-app/ хуудсуудыг build үед үүсгэнэ
export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: `${page.name} — TengerNextLab`,
    description: page.text,
    openGraph: { title: `${page.name} — TengerNextLab`, description: page.text, type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) notFound();
  return <ServicePage page={page} />;
}
