interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    // Заглушки ещё стеклянные, поэтому носят тёмную подложку с собой:
    // фон приложения теперь бумажный.
    <div className="dark-canvas flex min-h-full flex-col gap-2 px-5 pb-28 pt-8">
      <h1 className="text-2xl font-bold text-fg">{title}</h1>
      <p className="text-sm text-muted">{description}</p>
      <div className="glass mt-6 rounded-2xl p-6 text-center text-sm text-muted">
        Экран в разработке — здесь появится твой UI
      </div>
    </div>
  );
}
