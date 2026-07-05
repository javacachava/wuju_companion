import Link from "next/link";
import { listWorkshopCharacters } from "@/lib/domain/characterService";
import { workshopCategories } from "@/lib/domain/constants";
import { getUserInventory } from "@/lib/domain/customizationService";
import { InstallCharacterButton } from "@/components/workshop/InstallCharacterButton";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkshopPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const userId = "demo-user";

  const [characters, inventory] = await Promise.all([
    listWorkshopCharacters({ category, search, userId }),
    getUserInventory(userId)
  ]);
  const installedSet = new Set(inventory.installed.map((item) => item.characterId));

  return (
    <main className="page grid">
      <section className="card">
        <h1 style={{ margin: 0, fontSize: "2.3rem" }}>Marketplace de Personajes</h1>
        <p className="muted">
          Elige un personaje y guardalo en tu perfil para usarlo en Personalizacion.
        </p>
      </section>

      <form className="card" style={{ display: "grid", gap: 12 }}>
        <label>
          Buscar
          <input
            defaultValue={search}
            name="search"
            placeholder="Nombre, autor o descripción"
            className="input"
          />
        </label>
        <label>
          Categoría
          <select
            defaultValue={category ?? "Todos"}
            name="category"
            className="select"
          >
            {workshopCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="submit">
          Filtrar
        </button>
      </form>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {characters.map((character) => (
          <article className="card" key={character.id}>
            <h3 style={{ marginTop: 0 }}>{character.name}</h3>
            <p className="muted">{character.description}</p>
            <p>
              <strong>Autor:</strong> {character.author}
            </p>
            <p>
              <strong>Versión:</strong> {character.version}
            </p>
            <p>
              <strong>Rating:</strong> {character.rating} ({character.savesCount} guardados)
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <InstallCharacterButton
                characterId={character.id}
                version={character.version}
                installed={installedSet.has(character.id)}
              />
              <Link className="btn btn-outline" href={`/workshop/${character.id}`}>
                Ver ficha
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
