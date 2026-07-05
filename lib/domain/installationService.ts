import { createMockBundle } from "@/lib/data/mockWorkshop";
import { parseBundle } from "@/lib/bundle/parser";
import { validateBundleForInstall } from "@/lib/bundle/validator";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { runtimeStore } from "@/lib/domain/runtimeStore";
import type { CharacterMind, ParsedBundle, SkinAsset } from "@/lib/domain/types";

type InstallInput = {
  userId: string;
  characterId: string;
  version?: string;
};

type InstallResult = {
  saved: true;
  characterId: string;
  version: string;
  mind: CharacterMind;
  skin: SkinAsset;
};

type PersistedProfile = {
  version: string;
  mind: CharacterMind;
  skin: SkinAsset;
};

function parseSemver(version: string): [number, number, number] {
  const parts = version.split(".").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Versión inválida: ${version}`);
  }
  return [parts[0], parts[1], parts[2]];
}

function isLowerSemver(a: string, b: string): boolean {
  const [amajor, aminor, apatch] = parseSemver(a);
  const [bmajor, bminor, bpatch] = parseSemver(b);
  if (amajor !== bmajor) return amajor < bmajor;
  if (aminor !== bminor) return aminor < bminor;
  return apatch < bpatch;
}

async function loadPersistedProfileFromSupabase(
  characterId: string,
  version?: string
): Promise<PersistedProfile | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  let selectedVersion = version;
  if (!selectedVersion) {
    const { data: characterRow, error: characterError } = await supabase
      .from("workshop_characters")
      .select("current_version")
      .eq("id", characterId)
      .maybeSingle();
    if (characterError || !characterRow?.current_version) return null;
    selectedVersion = characterRow.current_version;
  }

  const { data: mindRow, error: mindError } = await supabase
    .from("character_minds")
    .select("id,character_id,version,personality_raw,instructions_raw,permissions,voice")
    .eq("character_id", characterId)
    .eq("version", selectedVersion)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (mindError || !mindRow) return null;

  const { data: skinRow, error: skinError } = await supabase
    .from("skins")
    .select("id,character_id,version,skin_path,preview_path,icon_path")
    .eq("character_id", characterId)
    .eq("version", selectedVersion)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (skinError || !skinRow) return null;

  return {
    version: selectedVersion,
    mind: {
      id: mindRow.id,
      characterId: mindRow.character_id,
      version: mindRow.version,
      personalityRaw: mindRow.personality_raw,
      instructionsRaw: mindRow.instructions_raw,
      permissions: mindRow.permissions,
      voice: mindRow.voice
    },
    skin: {
      id: skinRow.id,
      characterId: skinRow.character_id,
      version: skinRow.version,
      skinPath: skinRow.skin_path,
      previewPath: skinRow.preview_path,
      iconPath: skinRow.icon_path
    }
  };
}

function latestInstalledVersion(userId: string, characterId: string): string | undefined {
  const installed = runtimeStore
    .listInstalled(userId)
    .find((entry) => entry.characterId === characterId);
  return installed?.version;
}

function parsedToEntities(parsed: ParsedBundle): { mind: CharacterMind; skin: SkinAsset } {
  const baseId = `${parsed.metadata.id}_${parsed.metadata.version}`;
  return {
    mind: {
      id: `${baseId}_mind`,
      characterId: parsed.metadata.id,
      version: parsed.metadata.version,
      personalityRaw: parsed.personalityRaw,
      instructionsRaw: parsed.instructionsRaw,
      permissions: parsed.permissions,
      voice: parsed.voice
    },
    skin: {
      id: `${baseId}_skin`,
      characterId: parsed.metadata.id,
      version: parsed.metadata.version,
      skinPath: parsed.metadata.skin,
      previewPath: parsed.metadata.preview,
      iconPath: parsed.metadata.icon
    }
  };
}

export async function saveCharacterToProfile(input: InstallInput): Promise<InstallResult> {
  const supabase = getSupabaseAdminClient();
  const persistedProfile = await loadPersistedProfileFromSupabase(
    input.characterId,
    input.version
  );

  let selectedVersion: string;
  let mind: CharacterMind;
  let skin: SkinAsset;

  if (persistedProfile) {
    selectedVersion = persistedProfile.version;
    mind = persistedProfile.mind;
    skin = persistedProfile.skin;
  } else {
    const bytes = await createMockBundle(input.characterId, input.version ?? "1.0.0");
    const parsed = await parseBundle(bytes);
    const validated = validateBundleForInstall(
      parsed,
      latestInstalledVersion(input.userId, input.characterId)
    );
    const entities = parsedToEntities(validated);
    selectedVersion = validated.metadata.version;
    mind = entities.mind;
    skin = entities.skin;
  }

  const installedVersion = latestInstalledVersion(input.userId, input.characterId);
  if (installedVersion && isLowerSemver(selectedVersion, installedVersion)) {
    throw new Error(
      `Downgrade bloqueado: instalada ${installedVersion}, perfil ${selectedVersion}.`
    );
  }

  if (supabase) {
    const { error } = await supabase.rpc("save_character_to_profile", {
      p_user_id: input.userId,
      p_character_id: input.characterId,
      p_version: selectedVersion,
      p_mind_id: mind.id,
      p_skin_id: skin.id
    });
    if (error) {
      throw new Error(`Falló guardado en perfil: ${error.message}`);
    }
  } else {
    runtimeStore.upsertInstalled({
      userId: input.userId,
      characterId: input.characterId,
      version: selectedVersion,
      mind,
      skin,
      installedAt: new Date().toISOString()
    });
  }

  return {
    saved: true,
    characterId: input.characterId,
    version: selectedVersion,
    mind,
    skin
  };
}

export const installCharacterBundle = saveCharacterToProfile;
