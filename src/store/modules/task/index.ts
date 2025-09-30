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
    },
    updateTask(task: Task): void {
      const index = this.tasks.findIndex(it => it.task_id === task.task_id);
      if (index >= 0) {
        this.tasks.splice(index, 1, task);
      }
    }
  }
});
