import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

// Daftar semua fitur di features/
const features = [
  "admin",
  "auth",
  "budget",
  "bulk-invite",
  "calendar",
  "comments",
  "contracts",
  "dashboard",
  "documents",
  "encyclopedia",
  "events",
  "gallery",
  "guests",
  "invitation-custom",
  "notifications",
  "rundown",
  "seserahan",
  "subscription",
  "tasks",
  "vendors",
  "workspaces",
];

// Buat zona: setiap fitur tidak boleh mengimpor dari fitur lain
const featureZones = features.map((feature) => ({
  target: `./features/${feature}`,
  from: "./features",
  except: [feature],
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 1. Antar fitur tidak boleh saling impor.
            ...featureZones,

            // 2. Fitur tidak boleh mengimpor dari app/
            { target: "./features", from: "./app" },

            // 3. Shared code tidak boleh mengimpor dari features/ atau app/
            {
              target: ["./components", "./lib", "./hooks", "./config", "./types", "./shared"],
              from: ["./features", "./app"],
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
