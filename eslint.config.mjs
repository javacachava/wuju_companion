import { fileURLToPath } from "node:url";
import path from "node:path";
import { FlatCompat } from "@eslint/eslintrc";

// baseDirectory apunta a apps/web: ahí viven eslint-config-next y sus deps
const compat = new FlatCompat({
  baseDirectory: path.join(path.dirname(fileURLToPath(import.meta.url)), "apps/web"),
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
