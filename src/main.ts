import {createApp} from "vue";
import {setupRouter} from "@/router";
import {setupStore, useUiThemeStore} from "@/store";
import {bootstrapUiTheme} from "@/theme/uiTheme";

import 'virtual:uno.css'
import './styles/theme.css'

bootstrapUiTheme()


import App from "./App.vue";

async function bootstrap() {
  // 创建vue
  const app = createApp(App);
  // 挂载状态管理
  await setupStore(app);

  // Keep DOM theme in sync with persisted state
  useUiThemeStore().apply()
  // 挂载路由
  await setupRouter(app);
  app.mount("#app");
}

bootstrap();
