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
  title: "FokusTracker",
  description: "Геймифицированный трекер задач, целей и привычек",
};

export const viewport: Viewport = {
  // Бумага — основной фон приложения: и строка состояния PWA, и первый кадр
  // загрузки должны быть тёплыми, а не графитовыми.
  themeColor: "#e8e1cf",
  colorScheme: "light",
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
        <div className="paper-canvas relative isolate mx-auto flex h-dvh w-full max-w-107.5 flex-col overflow-hidden sm:border-x sm:border-ink/10 sm:shadow-2xl sm:shadow-ink/25">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>

  );
}
