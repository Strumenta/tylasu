import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ["tests/parser/*.ts"]
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            parser: tsParser,
        },
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
        },
        files: ["src/**/*.ts"]
    }, {
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": 0,
            "@typescript-eslint/no-var-requires": 0,
            "@typescript-eslint/no-unused-expressions": 0, // Fails with expect(...).to.be.undefined;
        },
        files: ["tests/**/*.ts"]
    });
