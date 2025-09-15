import type {Task} from "@/types/task";

export const useTaskStore = defineStore('task-store', {
  state: () => ({
    tasks: [] as Task[],
  }),
  getters: {
    getAllTask: state => state.tasks
  },
  actions: {
    setTasks(tasks: Task[]) {
      this.tasks = tasks
    },
    addTask(task: Task): void {
      this.tasks.push(task)
    },
    removeTask(id: number) {
      this.tasks = this.tasks.filter(task => task.task_id !== id)
    }
  }
});
