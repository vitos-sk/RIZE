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
  themeColor: "#0c0b0a",
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
      <body className="h-dvh bg-black font-sans text-fg antialiased">
        <div className="relative isolate mx-auto flex h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-bg sm:border-x sm:border-white/10 sm:shadow-2xl sm:shadow-black/60">
          <div className="app-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>

  );
}
