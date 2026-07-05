"use client";

import { useMemo, useState } from "react";
import { CharacterGrid } from "@/components/customization/CharacterGrid";
import { CharacterPreview } from "@/components/customization/CharacterPreview";
import { ColorPicker } from "@/components/customization/ColorPicker";
import { PermissionPanel } from "@/components/customization/PermissionPanel";
import { VoiceSelector } from "@/components/customization/VoiceSelector";
import { PersonalityPanel } from "@/components/customization/PersonalityPanel";
import { Toolbar, type ToolbarTab } from "@/components/customization/Toolbar";
import { AccessoryBar } from "@/components/customization/AccessoryBar";
import { ApplyProfileButton } from "@/components/customization/ApplyProfileButton";
import { WorkshopButton } from "@/components/customization/WorkshopButton";

type InventoryCharacter = {
  characterId: string;
  version: string;
  name: string;
  mindId: string;
  skinId: string;
  personalityRaw: string;
  instructionsRaw: string;
  permissions: {
    screen: boolean;
    clipboard: boolean;
    filesystem: boolean;
    microphone: boolean;
    ocr?: boolean;
    notifications?: boolean;
  };
  voice: {
    provider: string;
    voiceId: string;
    speed: number;
    pitch: number;
    language?: string;
  };
};

type Props = {
  items: InventoryCharacter[];
};

export function CustomizationWorkbench({ items }: Props) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    items[0]?.characterId ?? null
  );
  const [activeTab, setActiveTab] = useState<ToolbarTab>("skin");
  const [color, setColor] = useState("#60a5fa");
  const [scale, setScale] = useState(1);
  const [accessory, setAccessory] = useState("Sombreros");

  const selected = useMemo(
    () => items.find((item) => item.characterId === selectedCharacterId) ?? items[0],
    [items, selectedCharacterId]
  );

  if (!selected) {
    return (
      <section className="card">
        <h2>Personalización</h2>
        <p className="muted">No hay personajes guardados en tu perfil aún.</p>
        <WorkshopButton />
      </section>
    );
  }

  return (
    <div className="grid">
      <Toolbar activeTab={activeTab} onChange={setActiveTab} />

      <section className="card">
        <h2>Personajes</h2>
        <CharacterGrid
          characters={items.map((item) => ({
            characterId: item.characterId,
            name: item.name,
            version: item.version
          }))}
          selectedCharacterId={selected.characterId}
          onSelect={setSelectedCharacterId}
        />
      </section>

      <CharacterPreview
        title={selected.name}
        skinId={selected.skinId}
        colorHex={color}
        scale={scale}
      />

      {activeTab === "skin" ? (
        <section className="card" style={{ display: "grid", gap: 10 }}>
          <h3>Apariencia</h3>
          <ColorPicker colorHex={color} onChange={setColor} />
          <label style={{ display: "grid", gap: 6 }}>
            Tamaño: {scale.toFixed(1)}
            <input
              type="range"
              min={0.7}
              max={1.5}
              step={0.1}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
            />
          </label>
        </section>
      ) : null}

      {activeTab === "accesorios" ? (
        <AccessoryBar selected={accessory} onSelect={setAccessory} />
      ) : null}

      {activeTab === "voz" ? (
        <VoiceSelector
          voice={selected.voice}
          onPitchChange={() => {}}
          onSpeedChange={() => {}}
        />
      ) : null}

      {activeTab === "personalidad" ? (
        <PersonalityPanel
          personalityRaw={selected.personalityRaw}
          instructionsRaw={selected.instructionsRaw}
        />
      ) : null}

      {activeTab === "permisos" ? (
        <PermissionPanel permissions={selected.permissions} />
      ) : null}

      <section className="card" style={{ display: "flex", gap: 12 }}>
        <ApplyProfileButton
          characterId={selected.characterId}
          mindId={selected.mindId}
          skinId={selected.skinId}
        />
        <WorkshopButton />
      </section>
    </div>
  );
}
