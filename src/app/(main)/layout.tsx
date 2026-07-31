import { TabBar } from "@/components/layout/tab-bar";
import { AuthGate } from "@/components/auth/auth-gate";
import { PaperDefs } from "@/components/ui/paper-defs";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {/* Таб-бар лежит поверх контента: под матовым стеклом должно что-то проезжать.
          `min-h-0` здесь и на <main> обязателен: у flex-элемента min-height по умолчанию
          равен высоте контента, поэтому длинный список не сжимается, а распирает колонку —
          и таб-бар, привязанный к её низу, уезжает за нижний край экрана. */}
      <div className="relative flex h-full min-h-0 flex-col">
        <PaperDefs />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
        <TabBar />
      </div>
    </AuthGate>
  );
}
