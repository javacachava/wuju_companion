import JSZip from "jszip";
import type { WorkshopCharacter } from "@/lib/domain/types";

export const mockWorkshopCharacters: WorkshopCharacter[] = [
  {
    id: "code_guardian",
    name: "Code Guardian",
    author: "Julio",
    version: "1.0.0",
    description: "Especialista en auditoría y seguridad de código.",
    category: "Programming",
    price: 5,
    savesCount: 1280,
    rating: 4.9
  },
  {
    id: "teacher_mentor",
    name: "Teacher Mentor",
    author: "Workshop Team",
    version: "1.1.0",
    description: "Explica conceptos complejos paso a paso para aprendizaje.",
    category: "Education",
    price: 0,
    savesCount: 740,
    rating: 4.8
  }
];

function textToBase64Png(text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="100%" height="100%" fill="#eef3ff"/><text x="50%" y="50%" fill="#071a3d" font-size="40" dominant-baseline="middle" text-anchor="middle">${text}</text></svg>`;
  return Buffer.from(svg, "utf8").toString("base64");
}

export async function createMockBundle(
  characterId: string,
  version: string
): Promise<Uint8Array> {
  const character = mockWorkshopCharacters.find((item) => item.id === characterId);
  if (!character) {
    throw new Error("No existe bundle mock para ese personaje.");
  }
  const zip = new JSZip();

  zip.file(
    "metadata.json",
    JSON.stringify(
      {
        id: character.id,
        name: character.name,
        author: character.author,
        version,
        description: character.description,
        category: character.category,
        price: character.price,
        voice: "voice.json",
        personality: "personality.mb",
        instructions: "instructions.mb",
        skin: "skin.png",
        permissions: "permissions.json",
        preview: "preview.png",
        icon: "icon.png"
      },
      null,
      2
    )
  );
  zip.file("personality.mb", `NAME:\n${character.name}\n\nPERSONALITY:\nCalm\nAnalytical`);
  zip.file(
    "instructions.mb",
    "SKILL\nAudit Code\n\nINPUT\nSource Code\n\nOUTPUT\nMarkdown Report\n\nRULES\nAlways prioritize security."
  );
  zip.file(
    "permissions.json",
    JSON.stringify(
      {
        screen: true,
        clipboard: true,
        filesystem: false,
        microphone: true
      },
      null,
      2
    )
  );
  zip.file(
    "voice.json",
    JSON.stringify(
      {
        provider: "elevenlabs",
        voiceId: "guardian_voice",
        speed: 1,
        pitch: 0
      },
      null,
      2
    )
  );
  zip.file(
    "version.json",
    JSON.stringify(
      {
        version,
        changelog: "Initial workshop release."
      },
      null,
      2
    )
  );

  const imageContent = Buffer.from(textToBase64Png(character.name.split(" ")[0]), "base64");
  zip.file("skin.png", imageContent);
  zip.file("preview.png", imageContent);
  zip.file("icon.png", imageContent);

  return zip.generateAsync({ type: "uint8array" });
}
