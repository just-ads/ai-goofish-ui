import {useApi} from "./fetch";

export interface Task {
  task_id: number
  task_name: string
  enabled: boolean
  keyword: string
  description: string
  max_pages: number
  personal_only: boolean
  min_price?: string
  max_price?: string
  cron?: string
  running?: boolean
}

export type UpdateTask = Omit<Partial<Task>, 'task_id'> & {
  task_id: number
}

export async function getTasks() {
  const {data, error} = await useApi('/api/tasks').json<Task[]>();
  if (error.value) throw error.value;
  return data.value!;
}

export async function createTask(task: Omit<Task, 'task_id'>): Promise<Task> {
  const {data, error} = await useApi('/api/tasks/create').post(task).json();
  if (error.value) throw error.value;
  return data.value!;
}

export async function updateTask(task: UpdateTask) {
  const {data, error} = await useApi(`/api/tasks/update`).post(task).json<Task>();
  if (error.value) throw error.value;
  return data.value!;
}

export async function deleteTask(task_id: number) {
  const {error} = await useApi(`/api/tasks/delete/${task_id}`).delete();
  if (error.value) throw error.value;
}

export async function runTask(task_id: number) {
  const {error} = await useApi(`/api/tasks/run/${task_id}`).post();
  if (error.value) throw error.value;
}

export async function stopTask(task_id: number) {
  const {error} = await useApi(`/api/tasks/stop/${task_id}`);
  if (error.value) throw error.value;
}

export async function getTaskStatus(task_id: number) {
  const {data, error} = await useApi(`/api/tasks/status/${task_id}`).json();
  if (error.value) throw error.value;
  return data.value!;
}

export async function getRunningTasks() {
  const {data, error} = await useApi(`/api/tasks/status/`).json();
  if (error.value) throw error.value;
  return data.value!;
}
