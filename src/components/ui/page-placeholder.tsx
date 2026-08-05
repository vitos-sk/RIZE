import { PaperSheet } from "@/components/ui/paper-sheet";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    // Заглушка живёт на том же тёмном листе, что и остальные экраны:
    // стеклянной подложки в проекте больше нет.
    <div className="paper-canvas min-h-full">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-5 pt-7 pb-32">
        <header>
          <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">{title}</h1>
          <p className="mt-1.5 font-note text-sm text-ink-soft">{description}</p>
        </header>

        <PaperSheet innerClassName="px-4 py-8">
          <p className="text-center font-note text-sm text-ink-soft">
            Экран в разработке — здесь появится твой UI
          </p>
        </PaperSheet>
      </div>
    </div>
  );
}
