import {defineConfig} from "eslint/config";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
/*import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'*/

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  /*pluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**!/!*.vue'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ref: "readonly",
        computed: "readonly",
        watch: "readonly",
        watchEffect: "readonly",
        h: "readonly",
        useRouter: "readonly",
      },
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }*/
);
