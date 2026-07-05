export type WorkshopCategory =
  | "Programming"
  | "Business"
  | "Design"
  | "Education"
  | "Productivity";

export type PermissionFlags = {
  screen: boolean;
  clipboard: boolean;
  filesystem: boolean;
  microphone: boolean;
  ocr?: boolean;
  notifications?: boolean;
};

export type VoiceConfig = {
  provider: string;
  voiceId: string;
  speed: number;
  pitch: number;
  language?: string;
};

export type CharacterMind = {
  id: string;
  characterId: string;
  version: string;
  personalityRaw: string;
  instructionsRaw: string;
  permissions: PermissionFlags;
  voice: VoiceConfig;
};

export type SkinAsset = {
  id: string;
  characterId: string;
  version: string;
  skinPath: string;
  previewPath?: string;
  iconPath?: string;
};

export type WorkshopCharacter = {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  category: WorkshopCategory;
  price: number;
  savesCount: number;
  rating: number;
  installed?: boolean;
};

export type BundleMetadata = {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  category: WorkshopCategory;
  price: number;
  voice: string;
  personality: string;
  instructions: string;
  skin: string;
  permissions: string;
  preview?: string;
  icon?: string;
};

export type ParsedBundle = {
  metadata: BundleMetadata;
  personalityRaw: string;
  instructionsRaw: string;
  permissions: PermissionFlags;
  voice: VoiceConfig;
  versionInfo: {
    version: string;
    changelog?: string;
    releaseDate?: string;
  };
  files: Record<string, Uint8Array>;
};
