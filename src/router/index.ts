import Login from "@/views/login.vue";
import {createRouter, createWebHistory} from 'vue-router'

import type {App} from 'vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/tasks',
      component: () => import('@/views/index.vue'),
      meta: {
        title: '首页'
      },
      children: [{
        path: '/tasks',
        name: 'tasks',
        component: () => import('@/components/tasks.vue'),
        meta: {
          title: '任务列表'
        }
      }, {
        path: '/result',
        name: 'result',
        component: () => import('@/components/result.vue'),
        meta: {
          title: '结果列表'
        }
      }, {
        path: '/system',
        name: 'system',
        component: () => import('@/components/system.vue'),
        meta: {
          title: '系统设置'
        }
      }]
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录'
      }
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = '咸鱼监控机器人 - ' + to.meta.title;
  }
  next()
})


export async function setupRouter(app: App) {
  app.use(router)
  // 创建路由守卫
  // 路由准备就绪后挂载APP实例
  await router.isReady()
}

export default router
