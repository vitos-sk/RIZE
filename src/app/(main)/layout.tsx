import { TabBar } from "@/components/layout/tab-bar";
import { AuthGate } from "@/components/auth/auth-gate";
import { PaperDefs } from "@/components/ui/paper-defs";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {/* Таб-бар лежит поверх контента: под матовым стеклом должно что-то проезжать. */}
      <div className="relative flex h-full flex-col">
        <PaperDefs />
        <main className="flex-1 overflow-y-auto overscroll-contain">{children}</main>
        <TabBar />
      </div>
    </AuthGate>
  );
}
