// ESLint (lokal: npm run lint) — aturan resmi Remotion (deterministik, aset, dimensi genap, …) di atas TypeScript.
// Catatan: hook proyek ini bernama `pakai*` (bukan `use*`), jadi aturan rules-of-hooks React tidak dipakai.
import remotion from "@remotion/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/", ".bundle/", "out/"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    ...remotion.flatPlugin,
  },
);
