import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage/**",
      "hooks/**/*.backup.ts",
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Regras específicas para testes/legado: permitir require em testes e setup
  {
    files: [
      "__tests__/**",
      "jest.*",
      "jest.setup.ts",
      "tests/**",
      "coverage/**",
      "diagnostico.js",
      "testar-funcionalidades.js",
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'react/display-name': 'off',
      'prefer-const': 'warn',
      'react/no-unescaped-entities': 'off'
    }
  },
  // Regras específicas para app/components: não exigir entidades escapadas em textos
  {
    files: [
      "app/**",
      "components/**",
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
    }
  },
  // Exceção pontual: página de debug de DB pode conter ts-ignore por experimento
  {
    files: [
      "app/test-db/page.tsx"
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },
  // Permitir require somente em arquivos que dependem de comportamento de runtime (interop com jest/sonner e debug)
  {
    files: [
      "components/NewTransactionDialog.tsx",
      "utils/notify.ts",
      "app/test-db/page.tsx"
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': ['warn']
    }
  }
];

export default eslintConfig;
