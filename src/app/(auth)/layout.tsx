import { PaperDefs } from "@/components/ui/paper-defs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Свои <PaperDefs/>: фильтры рваного края подключены в (main)-лейауте, а вход
    // живёт в другой группе роутов — без них его листы вышли бы с ровными краями.
    <div className="flex h-full flex-col">
      <PaperDefs />
      {children}
    </div>
  );
}
