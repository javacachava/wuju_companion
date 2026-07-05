"use client";

type Props = {
  colorHex: string;
  onChange: (colorHex: string) => void;
};

export function ColorPicker({ colorHex, onChange }: Props) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      Color
      <input
        type="color"
        value={colorHex}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: 80, height: 40, border: "none", background: "transparent" }}
      />
    </label>
  );
}
