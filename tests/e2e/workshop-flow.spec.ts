import { test, expect } from "@playwright/test";

test("flujo workshop -> guardar perfil -> personalizar -> aplicar", async ({ page }) => {
  await page.goto("/workshop");
  await expect(page.getByRole("heading", { name: "Workshop" })).toBeVisible();

  await page.getByRole("button", { name: "Guardar en perfil" }).first().click();
  await expect(page.getByText("Guardado en perfil")).toBeVisible();

  await page.goto("/customization");
  await expect(page.getByRole("heading", { name: "Personalización", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText("Perfil aplicado correctamente.")).toBeVisible();
});
