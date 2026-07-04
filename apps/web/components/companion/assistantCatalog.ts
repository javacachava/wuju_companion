import type { CharacterProfile, Personality } from "@/lib/companion/types";

export type AssistantOption = {
  id: string;
  name: string;
  avatar: string;
  personality: Personality;
  voiceId: string;
  voiceLabel: string;
  summary: string;
  role: string;
  stats: {
    analysis: number;
    creativity: number;
    speed: number;
  };
};

export const ASSISTANT_CATALOG: AssistantOption[] = [
  {
    id: "purr-fect",
    name: "Purr-fect",
    avatar: "PF",
    personality: "amigable",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    voiceLabel: "Norma / cálida",
    summary: "Ideal para sesiones largas, explica con calma y mantiene contexto.",
    role: "Compañera principal",
    stats: {
      analysis: 85,
      creativity: 62,
      speed: 94,
    },
  },
  {
    id: "byte-warden",
    name: "Byte Warden",
    avatar: "BW",
    personality: "directo",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    voiceLabel: "Guardia / firme",
    summary: "Detecta riesgos rápido y prioriza hallazgos críticos en auditorías.",
    role: "Guardián de código",
    stats: {
      analysis: 96,
      creativity: 44,
      speed: 88,
    },
  },
  {
    id: "luna-build",
    name: "Luna Build",
    avatar: "LB",
    personality: "formal",
    voiceId: "MF3mGyEYCl7XYWbV9V6O",
    voiceLabel: "Formal / precisa",
    summary: "Excelente para planificación, documentación y entregas ordenadas.",
    role: "Planificación y QA",
    stats: {
      analysis: 82,
      creativity: 71,
      speed: 75,
    },
  },
  {
    id: "spark-bot",
    name: "Spark Bot",
    avatar: "SB",
    personality: "entusiasta",
    voiceId: "TxGEqnHWrfWFTfGW9XjX",
    voiceLabel: "Energía / dinámica",
    summary: "Propone variantes de UI e ideas de producto con ritmo alto.",
    role: "Creatividad y diseño",
    stats: {
      analysis: 68,
      creativity: 95,
      speed: 90,
    },
  },
  {
    id: "index-fox",
    name: "Index Fox",
    avatar: "IF",
    personality: "directo",
    voiceId: "VR6AewLTigWG4xSOukaG",
    voiceLabel: "Ágil / técnica",
    summary: "Navega repos grandes y encuentra dependencias con mucha precisión.",
    role: "Búsqueda técnica",
    stats: {
      analysis: 91,
      creativity: 58,
      speed: 93,
    },
  },
  {
    id: "mentor-nova",
    name: "Mentor Nova",
    avatar: "MN",
    personality: "amigable",
    voiceId: "XB0fDUnXU5powFXDhCwa",
    voiceLabel: "Mentora / clara",
    summary: "Perfecta para pairing, enseñanza y feedback de buenas prácticas.",
    role: "Aprendizaje guiado",
    stats: {
      analysis: 79,
      creativity: 83,
      speed: 70,
    },
  },
];

export function buildAssistantProfile(
  assistant: AssistantOption,
): CharacterProfile["assistant"] {
  return {
    id: assistant.id,
    name: assistant.name,
    avatar: assistant.avatar,
    personality: assistant.personality,
    voiceId: assistant.voiceId,
    role: assistant.role,
    summary: assistant.summary,
    voiceLabel: assistant.voiceLabel,
    stats: assistant.stats,
  };
}
