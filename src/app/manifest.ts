import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FokusTracker",
    short_name: "FokusTracker",
    description: "Геймифицированный трекер задач, целей и привычек",
    start_url: "/",
    display: "standalone",
    // Splash-экран PWA — тот же лист бумаги, что и фон приложения.
    background_color: "#e8e1cf",
    theme_color: "#e8e1cf",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
