"use client";

const accessories = ["Sombreros", "Gafas", "Mochilas", "Objetos"];

type Props = {
  selected: string;
  onSelect: (value: string) => void;
};

export function AccessoryBar({ selected, onSelect }: Props) {
  return (
    <section className="card">
      <h3>Accesorios</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {accessories.map((item) => (
          <button
            className={`btn ${selected === item ? "btn-primary" : "btn-outline"}`}
            key={item}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
