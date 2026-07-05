import { runtimeStore } from "@/lib/domain/runtimeStore";
import type { SkinAsset } from "@/lib/domain/types";

export async function listInstalledSkins(userId: string): Promise<SkinAsset[]> {
  return runtimeStore.listInstalled(userId).map((entry) => entry.skin);
}

export async function getInstalledSkin(
  userId: string,
  skinId: string
): Promise<SkinAsset | null> {
  return (
    runtimeStore
      .listInstalled(userId)
      .map((entry) => entry.skin)
      .find((skin) => skin.id === skinId) ?? null
  );
}
