import {createApp} from "vue";
import {setupRouter} from "@/router";
import {setupStore} from "@/store";

import './main.css'
import 'virtual:uno.css'

import App from "./App.vue";

async function bootstrap() {
  // 创建vue
  const app = createApp(App);
  // 挂载状态管理
  await setupStore(app);
  // 挂载路由
  await setupRouter(app);
  app.mount("#app");
}

bootstrap();
