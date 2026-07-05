import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { runtimeStore } from "@/lib/domain/runtimeStore";

type ApplyProfileInput = {
  userId: string;
  characterId: string;
  mindId: string;
  skinId: string;
};

export async function applyCustomizationProfile(input: ApplyProfileInput): Promise<{
  applied: true;
  appliedAt: string;
}> {
  const appliedAt = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { error } = await supabase.rpc("apply_character_profile", {
      p_user_id: input.userId,
      p_character_id: input.characterId,
      p_mind_id: input.mindId,
      p_skin_id: input.skinId
    });
    if (error) {
      throw new Error(`No se pudo aplicar perfil: ${error.message}`);
    }
  } else {
    runtimeStore.setActiveProfile({
      userId: input.userId,
      characterId: input.characterId,
      mindId: input.mindId,
      skinId: input.skinId,
      appliedAt
    });
  }

  return { applied: true, appliedAt };
}

export async function getUserInventory(userId: string): Promise<{
  installed: Array<{
    characterId: string;
    version: string;
    mindId: string;
    skinId: string;
  }>;
  activeProfile: {
    characterId: string;
    mindId: string;
    skinId: string;
    appliedAt: string;
  } | null;
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    const installed = runtimeStore.listInstalled(userId).map((entry) => ({
      characterId: entry.characterId,
      version: entry.version,
      mindId: entry.mind.id,
      skinId: entry.skin.id
    }));
    const active = runtimeStore.getActiveProfile(userId);
    return {
      installed,
      activeProfile: active
        ? {
            characterId: active.characterId,
            mindId: active.mindId,
            skinId: active.skinId,
            appliedAt: active.appliedAt
          }
        : null
    };
  }

  const { data: installedRows, error: installError } = await supabase
    .from("user_installed_characters")
    .select("character_id,version,mind_id,skin_id")
    .eq("user_id", userId);
  if (installError) {
    throw new Error(`No se pudo leer inventario: ${installError.message}`);
  }

  const { data: activeRow, error: activeError } = await supabase
    .from("user_active_profile")
    .select("character_id,mind_id,skin_id,applied_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (activeError) {
    throw new Error(`No se pudo leer perfil activo: ${activeError.message}`);
  }

  return {
    installed: (installedRows ?? []).map((row) => ({
      characterId: row.character_id,
      version: row.version,
      mindId: row.mind_id,
      skinId: row.skin_id
    })),
    activeProfile: activeRow
      ? {
          characterId: activeRow.character_id,
          mindId: activeRow.mind_id,
          skinId: activeRow.skin_id,
          appliedAt: activeRow.applied_at
        }
      : null
  };
}
