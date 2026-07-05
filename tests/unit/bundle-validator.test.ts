import { describe, expect, it } from "vitest";
import { createMockBundle } from "@/lib/data/mockWorkshop";
import { parseBundle } from "@/lib/bundle/parser";
import { validateBundleForInstall } from "@/lib/bundle/validator";

describe("bundle validator", () => {
  it("acepta bundle válido", async () => {
    const bundle = await createMockBundle("code_guardian", "1.0.0");
    const parsed = await parseBundle(bundle);
    const result = validateBundleForInstall(parsed);
    expect(result.metadata.id).toBe("code_guardian");
  });

  it("bloquea downgrade", async () => {
    const bundle = await createMockBundle("code_guardian", "1.0.0");
    const parsed = await parseBundle(bundle);
    expect(() => validateBundleForInstall(parsed, "1.1.0")).toThrow(/Downgrade/);
  });
});
