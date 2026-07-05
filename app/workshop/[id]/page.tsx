import { notFound } from "next/navigation";
import { getWorkshopCharacterById } from "@/lib/domain/characterService";
import { getUserInventory } from "@/lib/domain/customizationService";
import { InstallCharacterButton } from "@/components/workshop/InstallCharacterButton";

type Props = {
  params: Promise<{ id: string }>;
};

const defaultPermissions = [
  { name: "Pantalla", enabled: true },
  { name: "Micrófono", enabled: true },
  { name: "Clipboard", enabled: true },
  { name: "Archivos", enabled: false }
];

export default async function CharacterDetailPage({ params }: Props) {
  const { id } = await params;
  const character = await getWorkshopCharacterById(id);
  if (!character) notFound();

  const inventory = await getUserInventory("demo-user");
  const installed = inventory.installed.find((item) => item.characterId === character.id);

  return (
    <main className="page grid">
      <section className="card">
        <h1 style={{ marginTop: 0, fontSize: "2.3rem" }}>{character.name}</h1>
        <p className="muted">{character.category}</p>
        <p>by {character.author}</p>
        <p>{character.description}</p>
        <p>
          <strong>Rating:</strong> {character.rating} -{" "}
          <strong>Guardados:</strong> {character.savesCount}
        </p>
        <InstallCharacterButton
          characterId={character.id}
          version={character.version}
          installed={Boolean(installed)}
        />
      </section>

      <section className="card">
        <h2>Permisos</h2>
        <ul>
          {defaultPermissions.map((permission) => (
            <li key={permission.name}>
              {permission.enabled ? "✓" : "✕"} {permission.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Incluye</h2>
        <ul>
          <li>✓ Personalidad</li>
          <li>✓ Skin</li>
          <li>✓ Voz</li>
          <li>✓ Instrucciones</li>
          <li>✓ Configuración</li>
        </ul>
      </section>

      <section className="card">
        <h2>Versiones</h2>
        <ul>
          <li>{character.version} (actual)</li>
          <li>1.0.0</li>
        </ul>
      </section>
    </main>
  );
}
