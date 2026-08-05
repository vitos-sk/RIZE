import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FokusTracker",
    short_name: "FokusTracker",
    description: "Геймифицированный трекер задач, целей и привычек",
    start_url: "/",
    display: "standalone",
    // Splash-экран PWA — тот же тёмный лист, что и фон приложения.
    background_color: "#1a1512",
    theme_color: "#1a1512",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
