export type PartCategory =
  | "hair"
  | "eyes"
  | "mouth"
  | "accessory"
  | "clothing";

export type Personality = "amigable" | "directo" | "entusiasta" | "formal";

export type CharacterPart = {
  id: string;
  name: string;
  imageUrl: string;
};

export type CharacterParts = Record<PartCategory, CharacterPart | null>;

export type SelectedAssistant = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  summary: string;
  voiceLabel: string;
  stats: {
    analysis: number;
    creativity: number;
    speed: number;
  };
};

export type CharacterProfile = {
  id: string;
  userName: string;
  personality: Personality;
  voiceId: string;
  parts: CharacterParts;
  assistant: SelectedAssistant | null;
};
