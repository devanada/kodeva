import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn'] }],
    },
  },
  {
    // command-line scripts report through the console on purpose
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
  {
    // generated shadcn primitives are not hand-edited, so rules they trip are relaxed here
    files: ['src/components/ui/**'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // the Sanity Studio is a separate package with its own toolchain
    'studio/**',
  ]),
]);

export default eslintConfig;
