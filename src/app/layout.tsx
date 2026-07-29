import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "FokusTracker",
  description: "Геймифицированный трекер задач, целей и привычек",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
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
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-dvh bg-black font-sans text-fg antialiased">
        <div className="mx-auto flex h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-bg sm:border-x sm:border-border sm:shadow-2xl sm:shadow-black/60">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>

  );
}
