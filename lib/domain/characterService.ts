import { mockWorkshopCharacters } from "@/lib/data/mockWorkshop";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { WorkshopCharacter } from "@/lib/domain/types";

export type CharacterListFilters = {
  category?: string;
  search?: string;
  userId?: string;
};

function applyFilters(
  characters: WorkshopCharacter[],
  filters: CharacterListFilters
): WorkshopCharacter[] {
  return characters.filter((character) => {
    if (filters.category && filters.category !== "Todos") {
      if (character.category !== filters.category) return false;
    }
    if (filters.search) {
      const normalized = filters.search.toLowerCase();
      const haystack = `${character.name} ${character.author} ${character.description}`.toLowerCase();
      if (!haystack.includes(normalized)) return false;
    }
    return true;
  });
}

export async function listWorkshopCharacters(
  filters: CharacterListFilters
): Promise<WorkshopCharacter[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return applyFilters(mockWorkshopCharacters, filters);

  const { data, error } = await supabase
    .from("workshop_characters")
    .select(
      "id,name,author,description,category,price,saves_count,rating,current_version"
    )
    .eq("status", "published")
    .order("saves_count", { ascending: false });

  if (error || !data) {
    return applyFilters(mockWorkshopCharacters, filters);
  }

  const mapped: WorkshopCharacter[] = data.map((row) => ({
    id: row.id,
    name: row.name,
    author: row.author,
    version: row.current_version,
    description: row.description,
    category: row.category,
    price: row.price,
    savesCount: row.saves_count,
    rating: row.rating
  }));

  return applyFilters(mapped, filters);
}

export async function getWorkshopCharacterById(
  id: string
): Promise<WorkshopCharacter | null> {
  const list = await listWorkshopCharacters({});
  return list.find((item) => item.id === id) ?? null;
}
