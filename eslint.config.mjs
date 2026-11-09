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

// Daftar dependensi modular yang diizinkan antar fitur
const featureDependencies = {
  dashboard: ["budget", "guests", "tasks", "notifications", "admin", "calendar", "events"],
  vendors: ["comments"],
  events: ["rundown"],
  encyclopedia: ["cultural-workflow"],
};

// Buat zona: setiap fitur tidak boleh mengimpor dari fitur lain kecuali yang didefinisikan secara eksplisit
const featureZones = features.map((feature) => ({
  target: `./features/${feature}`,
  from: "./features",
  except: [feature, ...(featureDependencies[feature] ?? [])],
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-e2e/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "public/sw.js",
    "tests/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 1. Antar fitur tidak boleh saling impor tanpa dependensi terdaftar
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
