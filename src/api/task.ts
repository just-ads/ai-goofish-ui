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
}

export async function getTasks() {
  const {data, error} = await useApi<Task[]>('/api/tasks');
  if (error.value) throw error.value;
  return data.value!;
}


export async function updateTask(task: Task) {
  const {data} = await useApi<Task[]>(`/api/tasks/update/${task.task_id}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(task),
  });
  return data.value!;
}
