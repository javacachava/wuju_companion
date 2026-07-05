import { z } from "zod";

const semverRegex = /^\d+\.\d+\.\d+$/;

export const metadataSchema = z.object({
  id: z.string().min(3).max(64).regex(/^[a-z0-9_]+$/),
  name: z.string().min(1).max(80),
  author: z.string().min(1).max(80),
  version: z.string().regex(semverRegex),
  description: z.string().min(1).max(400),
  category: z.enum([
    "Programming",
    "Business",
    "Design",
    "Education",
    "Productivity"
  ]),
  price: z.number().int().min(0),
  voice: z.string().min(1),
  personality: z.string().min(1),
  instructions: z.string().min(1),
  skin: z.string().min(1),
  permissions: z.string().min(1),
  preview: z.string().optional(),
  icon: z.string().optional()
});

export const permissionsSchema = z.object({
  screen: z.boolean(),
  clipboard: z.boolean(),
  filesystem: z.boolean(),
  microphone: z.boolean(),
  ocr: z.boolean().optional(),
  notifications: z.boolean().optional()
});

export const voiceSchema = z.object({
  provider: z.string().min(1),
  voiceId: z.string().min(1),
  speed: z.number().min(0.5).max(2),
  pitch: z.number().min(-12).max(12),
  language: z.string().min(2).max(10).optional()
});

export const versionSchema = z.object({
  version: z.string().regex(semverRegex),
  changelog: z.string().max(2000).optional(),
  releaseDate: z.string().datetime().optional()
});

export type MetadataInput = z.infer<typeof metadataSchema>;
export type PermissionsInput = z.infer<typeof permissionsSchema>;
export type VoiceInput = z.infer<typeof voiceSchema>;
export type VersionInput = z.infer<typeof versionSchema>;
