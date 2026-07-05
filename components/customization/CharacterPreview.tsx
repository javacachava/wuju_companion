type Props = {
  title: string;
  skinId: string;
  colorHex: string;
  scale: number;
};

export function CharacterPreview({ title, skinId, colorHex, scale }: Props) {
  return (
    <section className="card">
      <h3>Vista previa</h3>
      <div
        style={{
          borderRadius: 14,
          minHeight: 220,
          background: "linear-gradient(145deg, #edf3ff 0%, #f8fbff 100%)",
          border: "1px solid var(--border)",
          display: "grid",
          placeItems: "center"
        }}
      >
        <div
          style={{
            width: `${120 * scale}px`,
            height: `${120 * scale}px`,
            borderRadius: "50%",
            background: colorHex,
            border: "3px solid #fff",
            display: "grid",
            placeItems: "center"
          }}
        >
          <strong style={{ color: "#071a3d" }}>{title.slice(0, 2).toUpperCase()}</strong>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>
        Skin activo: {skinId}
      </p>
    </section>
  );
}
