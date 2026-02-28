import {useApi} from "@/api/fetch";
import {withResolvers} from "@/utils/promise";

import type {Task} from "@/types/task";

export const useTaskStore = defineStore('task-store', () => {
  const tasks = ref<Task[]>([]);
  let initialized = false;
  let initializing = false;
  const {promise, resolve} = withResolvers<Task[]>() //Promise.withResolvers<Task[]>();


  const getTask = (id: number) => {
    return tasks.value.find(it => it.task_id === id);
  }

  const addTask = (task: Task) => {
    tasks.value.push(task)
  }

  const removeTask = (id: number) => {
    const index = tasks.value.findIndex(it => it.task_id === id)
    if (index > -1) {
      tasks.value.splice(index, 1)
    }
  }

  const updateTask = (task: Task) => {
    const index = tasks.value.findIndex(it => it.task_id === task.task_id)
    if (index >= 0) {
      tasks.value.splice(index, 1, task);
    }
  }

  const initState = async () => {
    if (initializing) return;
    initializing = true;
    try {
      const {data, error} = await useApi('/api/tasks').json<Task[]>();
      if (!error.value && data.value) {
        tasks.value = data.value;
        initialized = true;
      }
    } finally {
      initializing = false;
      resolve(tasks.value)
    }
  }

  return {
    get tasks() {
      if (!initialized) {
        initState()
      }
      return tasks
    },
    onReady() {
      if (!initialized) {
        initState()
      }
      return promise
    },
    getTask,
    addTask,
    removeTask,
    updateTask,
  }
})
