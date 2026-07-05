// Personajes del marketplace usables como cara del compañero.
// Se elige uno y reemplaza al chibi compuesto por partes en el preview.
export type AvatarOption = {
  id: string;
  name: string;
  image: string;
};

export const AVATAR_CATALOG: AvatarOption[] = [
  { id: "policia", name: "Policía", image: "/marketplace/characters/policia.png" },
  { id: "brujo", name: "Brujo", image: "/marketplace/characters/brujo.png" },
  { id: "angel", name: "Ángel", image: "/marketplace/characters/angel.png" },
  { id: "robot", name: "Robot", image: "/marketplace/characters/robot.png" },
  { id: "payaso", name: "Payaso", image: "/marketplace/characters/payaso.png" },
  { id: "marinero", name: "Marinero", image: "/marketplace/characters/marinero.png" },
  { id: "traje", name: "Traje", image: "/marketplace/characters/traje.png" },
  { id: "mochila", name: "Mochila Dev", image: "/marketplace/characters/mochila.png" },
  { id: "pc", name: "PC", image: "/marketplace/characters/pc.png" },
  { id: "cabo-verde", name: "Cabo Verde", image: "/marketplace/characters/cabo-verde.png" },
  { id: "camisa", name: "Camisa", image: "/marketplace/characters/camisa.png" },
  { id: "sueter", name: "Suéter", image: "/marketplace/characters/sueter.png" },
];

// Personaje por defecto cuando el usuario todavía no eligió uno.
export const DEFAULT_AVATAR: AvatarOption = AVATAR_CATALOG[0]!;
