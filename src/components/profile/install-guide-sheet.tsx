"use client";

import { useState } from "react";
import Image from "next/image";
import { Apple, ArrowLeft, Bot, X } from "lucide-react";

type Platform = "ios" | "android";

interface InstallStep {
  title: string;
  hint: string;
  image: string;
  alt: string;
  /** Реальный размер файла: скриншоты обрезаны по корпусу телефона и различаются. */
  width: number;
  height: number;
}

/**
 * Скриншоты лежат в `public/install` — это статичная памятка, а не данные,
 * поэтому картинки зашиты рядом с текстом шагов.
 */
const STEPS: Record<Platform, InstallStep[]> = {
  ios: [
    {
      title: "Открой Kaizn в Safari",
      hint: "Внизу экрана нажми кнопку «Поделиться» — квадрат со стрелкой вверх.",
      image: "/install/ios-1.jpg",
      alt: "Кнопка «Поделиться» в нижней панели Safari",
      width: 620,
      height: 1274,
    },
    {
      title: "Пролистай список вниз",
      hint: "Найди пункт «На экран „Домой“» (Add to Home Screen) и нажми на него.",
      image: "/install/ios-2.jpg",
      alt: "Пункт «Add to Home Screen» в меню «Поделиться»",
      width: 621,
      height: 1274,
    },
    {
      title: "Нажми «Добавить»",
      hint: "Кнопка справа вверху. Иконка Kaizn появится на главном экране — дальше он открывается как обычное приложение.",
      image: "/install/ios-3.jpg",
      alt: "Кнопка «Добавить» и готовая иконка на главном экране",
      width: 620,
      height: 1275,
    },
  ],
  android: [
    {
      title: "Открой Kaizn в Chrome",
      hint: "Нажми ⋮ в правом верхнем углу и выбери «Добавить на гл. экран» (Add to Home screen).",
      image: "/install/android-1.jpg",
      alt: "Пункт «Add to Home screen» в меню Chrome",
      width: 708,
      height: 1280,
    },
    {
      title: "Нажми «Добавить»",
      hint: "Название можно оставить как есть. Ярлык Kaizn появится на главном экране и будет открываться без адресной строки.",
      image: "/install/android-2.jpg",
      alt: "Диалог «Add to Home screen» с кнопкой «Добавить»",
      width: 704,
      height: 1280,
    },
  ],
};

const PLATFORM_TITLE: Record<Platform, string> = {
  ios: "iPhone · Safari",
  android: "Android · Chrome",
};

const PLATFORM_NOTE: Record<Platform, string> = {
  ios: "Важно: на iPhone это работает только в Safari. Из Chrome ярлык на «Домой» добавить не получится.",
  android: "Если пункта в меню нет — обнови Chrome или открой сайт в нём, а не во встроенном браузере соцсети.",
};

interface InstallGuideSheetProps {
  onClose: () => void;
}

export function InstallGuideSheet({ onClose }: InstallGuideSheetProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Скроллится ВНУТРЕННИЙ слой: рваный фон лежит на неподвижной обёртке. */}
      <div className="paper-sheet absolute inset-x-0 bottom-0 z-40 flex max-h-[90%] flex-col">
        <div className="paper-sheet-bg absolute inset-0 rounded-t-[3px]" aria-hidden="true" />
        <span
          className="paper-tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-[3deg]"
          aria-hidden="true"
        />

        <div className="relative min-h-0 overflow-y-auto px-5 pt-3 pb-8">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />

          <div className="mb-5 flex items-center justify-between gap-2">
            {platform ? (
              <button
                type="button"
                onClick={() => setPlatform(null)}
                aria-label="Назад"
                className="paper-chip-bg rounded-full p-1.5 text-ink"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-8 w-8" />
            )}

            <h2 className="font-hand text-2xl leading-none font-bold text-ink">
              {platform ? PLATFORM_TITLE[platform] : "Установка"}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="paper-chip-bg rounded-full p-1.5 text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {platform === null ? (
            <div className="flex flex-col gap-5">
              <p className="text-center font-note text-[1.05rem] text-ink">
                У тебя iPhone или Android?
              </p>
              <p className="-mt-3 text-center font-note text-xs text-ink-soft">
                Шаги отличаются — выбери телефон, и покажу твои.
              </p>

              <div className="flex gap-3">
                <PlatformButton
                  label="iPhone"
                  caption="Safari"
                  icon={<Apple className="h-7 w-7 text-ink" strokeWidth={1.6} />}
                  onClick={() => setPlatform("ios")}
                />
                <PlatformButton
                  label="Android"
                  caption="Chrome"
                  icon={<Bot className="h-7 w-7 text-ink" strokeWidth={1.6} />}
                  onClick={() => setPlatform("android")}
                />
              </div>

              <p className="text-center font-note text-xs text-ink-soft">
                Ничего скачивать не нужно: Kaizn ставится прямо из браузера за 20 секунд.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <ol className="flex flex-col gap-6">
                {STEPS[platform].map((step, index) => (
                  <li key={step.image} className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="paper-chip-bg-olive relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                        <span className="relative font-note text-sm font-bold text-ink">
                          {index + 1}
                        </span>
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-note text-[1.05rem] leading-tight font-bold text-ink">
                          {step.title}
                        </span>
                        <span className="font-note text-sm leading-snug text-ink-soft">
                          {step.hint}
                        </span>
                      </div>
                    </div>

                    <div className="paper-inset overflow-hidden rounded-sm p-2">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        width={step.width}
                        height={step.height}
                        sizes="(max-width: 430px) 90vw, 380px"
                        className="mx-auto h-auto w-full max-w-[240px] rounded-sm"
                      />
                    </div>
                  </li>
                ))}
              </ol>

              <p className="font-note text-xs leading-snug text-ink-soft">
                {PLATFORM_NOTE[platform]}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="paper-sheet w-full transition-transform active:scale-[0.98]"
              >
                <span className="paper-chip-bg-olive absolute inset-0" aria-hidden="true" />
                <span className="relative block py-3.5 text-center font-note text-[1.05rem] font-bold text-ink">
                  Готово
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface PlatformButtonProps {
  label: string;
  caption: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function PlatformButton({ label, caption, icon, onClick }: PlatformButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="paper-sheet flex-1 transition-transform active:scale-[0.98]"
    >
      <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
      <span className="relative flex flex-col items-center gap-1.5 px-4 py-5">
        {icon}
        <span className="font-note text-[1.05rem] font-bold text-ink">{label}</span>
        <span className="font-note text-xs text-ink-soft">{caption}</span>
      </span>
    </button>
  );
}
