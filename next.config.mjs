// GitHub Pages дээр сайт https://<хэрэглэгч>.github.io/<repo-нэр>/ хаягаар ажилладаг.
// GitHub Actions нь NEXT_PUBLIC_BASE_PATH-д "/<repo-нэр>"-ийг автоматаар тавьдаг.
// Компьютер дээрээ ажиллуулахад хоосон байна.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // статик HTML файлууд үүсгэнэ (out/ хавтас)
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
