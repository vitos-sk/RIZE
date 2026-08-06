import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaizn",
    short_name: "Kaizn",
    description: "Трекер задач, целей и привычек",
    start_url: "/",
    display: "standalone",
    // Splash-экран PWA — тот же тёмный лист, что и фон приложения.
    background_color: "#1a1512",
    theme_color: "#1a1512",
    // Иконка на главном экране телефона. Файлы собирает scripts/generate-icons.mjs
    // из одного SVG-исходника (public/app-icon.svg) — правки вносить там, не вручную.
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // maskable: Android режет иконку под форму лаунчера (круг, сквиркл), поэтому
      // у этого варианта лист ужат в safe zone, а поля залиты фоном приложения.
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
