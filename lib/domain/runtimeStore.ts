import type { CharacterMind, SkinAsset } from "@/lib/domain/types";

type InstalledRecord = {
  userId: string;
  characterId: string;
  version: string;
  mind: CharacterMind;
  skin: SkinAsset;
  installedAt: string;
};

type ActiveProfile = {
  userId: string;
  characterId: string;
  mindId: string;
  skinId: string;
  appliedAt: string;
};

const installedByUser = new Map<string, InstalledRecord[]>();
const activeProfileByUser = new Map<string, ActiveProfile>();

export const runtimeStore = {
  listInstalled(userId: string): InstalledRecord[] {
    return installedByUser.get(userId) ?? [];
  },
  upsertInstalled(record: InstalledRecord): void {
    const list = installedByUser.get(record.userId) ?? [];
    const idx = list.findIndex((item) => item.characterId === record.characterId);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    installedByUser.set(record.userId, list);
  },
  setActiveProfile(profile: ActiveProfile): void {
    activeProfileByUser.set(profile.userId, profile);
  },
  getActiveProfile(userId: string): ActiveProfile | null {
    return activeProfileByUser.get(userId) ?? null;
  }
};
