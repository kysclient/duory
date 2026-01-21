import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://duory.app";

  // 주요 페이지 리스트
  const routes = [
    "",
    "/welcome",
    "/community",
    "/memories",
    "/questions",
    "/anniversaries",
    "/privacy",
    "/terms",
  ].map((route) => ({
    changeFrequency: (route === "" ? "daily" : "weekly") as MetadataRoute.Sitemap[number]["changeFrequency"],
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    priority: route === "" ? 1 : 0.7,
  }));

  return [...routes];
}
