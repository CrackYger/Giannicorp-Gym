import type { PropsWithChildren, ReactNode } from "react";

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: PropsWithChildren<TabsProps>) {
  return (
    <div className="flex gap-2 rounded-xl bg-zinc-900 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
            activeKey === t.key ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
