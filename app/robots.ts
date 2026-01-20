import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/onboarding/", "/settings/", "/api/"], // 개인정보 및 내부 API 제외
    },
    sitemap: "https://duory.app/sitemap.xml",
  };
}
