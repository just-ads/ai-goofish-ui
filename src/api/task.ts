import {useApi} from "./fetch";

import type {Task, TaskResult, UpdateTask} from "@/types/task";

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
  const {data, error} = await useApi(`/api/tasks/status`).json();
  if (error.value) throw error.value;
  return data.value!;
}

export async function getTaskResult(id: number, options?: { page?: number, limit?: number }): Promise<{ total: number, page: number, limit: number, items: TaskResult[] }> {
  const {data, error} = await useApi(`/api/results/${id}`).post(options).json();
  if (error.value) throw error.value;
  return data.value!;
}

export async function removeTaskResult(id: number) {
  const {error} = await useApi(`/api/results/${id}`).delete();
  if (error.value) throw error.value;
}
