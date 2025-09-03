import type { UserConfig, ConfigEnv } from "vite";
import { loadEnv } from "vite";
import { createVitePlugins } from "./build/vite/plugin";
import { wrapperEnv } from "./build/utils";
import { resolve } from "path";
// https://vitejs.dev/config/
function pathResolve(dir: string) {
  return resolve(process.cwd(), ".", dir);
}
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const isBuild = command === "build";
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  return {
    resolve: {
      alias: [
        {
          find: /\/#\//,
          replacement: pathResolve("types") + "/",
        },
        {
          find: "@",
          replacement: pathResolve("src") + "/",
        },
      ],
    },
    plugins: createVitePlugins(viteEnv, isBuild),
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        }
      }
    }
  };
};
