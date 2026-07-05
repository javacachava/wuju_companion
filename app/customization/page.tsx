import { CustomizationWorkbench } from "@/components/customization/CustomizationWorkbench";
import { runtimeStore } from "@/lib/domain/runtimeStore";
import { mockWorkshopCharacters } from "@/lib/data/mockWorkshop";

function resolveCharacterName(characterId: string): string {
  return (
    mockWorkshopCharacters.find((item) => item.id === characterId)?.name ?? characterId
  );
}

export default async function CustomizationPage() {
  const installed = runtimeStore.listInstalled("demo-user");
  const items = installed.map((entry) => ({
    characterId: entry.characterId,
    version: entry.version,
    name: resolveCharacterName(entry.characterId),
    mindId: entry.mind.id,
    skinId: entry.skin.id,
    personalityRaw: entry.mind.personalityRaw,
    instructionsRaw: entry.mind.instructionsRaw,
    permissions: entry.mind.permissions,
    voice: entry.mind.voice
  }));

  return (
    <main className="page grid">
      <section className="card">
        <h1 style={{ margin: 0, fontSize: "2.3rem" }}>Personalizacion</h1>
        <p className="muted">
          Combina mente y apariencia desde los personajes guardados en tu perfil.
        </p>
      </section>
      <CustomizationWorkbench items={items} />
    </main>
  );
}
