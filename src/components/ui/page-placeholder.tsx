interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-2 px-5 pt-8">
      <h1 className="text-2xl font-bold text-fg">{title}</h1>
      <p className="text-sm text-muted">{description}</p>
      <div className="glass mt-6 rounded-2xl p-6 text-center text-sm text-muted">
        Экран в разработке — здесь появится твой UI
      </div>
    </div>
  );
}
