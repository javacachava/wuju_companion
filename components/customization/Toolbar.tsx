"use client";

export type ToolbarTab =
  | "skin"
  | "accesorios"
  | "voz"
  | "personalidad"
  | "permisos";

const tabMap: Array<{ key: ToolbarTab; label: string; icon: string }> = [
  { key: "skin", label: "Skin", icon: "👕" },
  { key: "accesorios", label: "Accesorios", icon: "🎒" },
  { key: "voz", label: "Voz", icon: "🎤" },
  { key: "personalidad", label: "Personalidad", icon: "❤" },
  { key: "permisos", label: "Permisos", icon: "⚙" }
];

type Props = {
  activeTab: ToolbarTab;
  onChange: (tab: ToolbarTab) => void;
};

export function Toolbar({ activeTab, onChange }: Props) {
  return (
    <nav
      className="card"
      style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}
    >
      {tabMap.map((tab) => (
        <button
          className={`btn ${activeTab === tab.key ? "btn-primary" : "btn-outline"}`}
          key={tab.key}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </nav>
  );
}
