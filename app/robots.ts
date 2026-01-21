import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const disallowPaths = ["/onboarding/", "/settings/", "/api/"]; // 개인정보 및 내부 API 제외

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPaths,
      },
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: disallowPaths,
      },
      {
        userAgent: "Yeti/1.0",
        allow: "/",
        disallow: disallowPaths,
      },
    ],
    sitemap: "https://duory.app/sitemap.xml",
  };
}
