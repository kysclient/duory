import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duory - 우리의 추억",
    short_name: "Duory",
    description: "연인과 함께하는 특별한 추억 기록 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF5A8E",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/logo_180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo_180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/logo_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    categories: ["lifestyle", "social"],
  }
}

