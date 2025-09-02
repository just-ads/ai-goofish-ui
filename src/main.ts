import { createApp } from "vue";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import Antd from "ant-design-vue";
import 'ant-design-vue/dist/reset.css';
import App from "./App.vue";
async function bootStrap() {
  // 创建vue
  const app = createApp(App);
  app.use(Antd);
  // 挂载状态管理
  await setupStore(app);
  // 挂载路由
  await setupRouter(app);
  app.mount("#app");
}
bootStrap();
