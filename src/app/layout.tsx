import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Geist_Mono, Neucha } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Бумажная тема Главной: заголовки — жирный рукописный Caveat,
// текст и подписи — карандашный Neucha. Оба с кириллицей.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

const neucha = Neucha({
  variable: "--font-neucha",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kaizn",
  description: "Трекер задач, целей и привычек",
  // iOS не читает манифест: иконку для «Добавить на экран «Домой»» он берёт только
  // из apple-touch-icon, а название под ней — из appleWebApp.title.
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-120.png", sizes: "120x120", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Kaizn",
    statusBarStyle: "black",
  },
  other: {
    // Next отдаёт только современный `mobile-web-app-capable`; iOS до 17 знает
    // исключительно этот тег, без него ярлык открывается в Safari с адресной строкой.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  // Тёмный лист — основной фон приложения: и строка состояния PWA, и первый кадр
  // загрузки должны быть угольными, светлой вспышки при запуске быть не должно.
  themeColor: "#1a1512",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${neucha.variable} h-full`}
    >
      {/* Фон-бумага задан на body в globals.css — «телефон» и поле вокруг него
          на десктопе лежат на одном листе, поэтому тёмного кадра при загрузке нет. */}
      <body className="h-dvh font-sans text-ink antialiased">
        <div className="paper-canvas relative isolate mx-auto flex h-dvh w-full max-w-107.5 flex-col overflow-hidden sm:border-x sm:border-ink/10 sm:shadow-2xl sm:shadow-black/60">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>

  );
}
