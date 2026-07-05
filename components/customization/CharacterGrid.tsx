"use client";

type CharacterCard = {
  characterId: string;
  name: string;
  version: string;
};

type Props = {
  characters: CharacterCard[];
  selectedCharacterId: string | null;
  onSelect: (characterId: string) => void;
};

export function CharacterGrid({
  characters,
  selectedCharacterId,
  onSelect
}: Props) {
  if (!characters.length) {
    return <p className="muted">Instala personajes desde Workshop para verlos aquí.</p>;
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      {characters.map((character) => {
        const active = selectedCharacterId === character.characterId;
        return (
          <button
            className="card"
            key={character.characterId}
            onClick={() => onSelect(character.characterId)}
            style={{
              textAlign: "left",
              borderColor: active ? "var(--accent)" : "var(--border)",
              background: active ? "#f4f8ff" : "var(--surface)",
              cursor: "pointer"
            }}
          >
            <strong>{character.name}</strong>
            <p className="muted">Version {character.version}</p>
          </button>
        );
      })}
    </div>
  );
}
