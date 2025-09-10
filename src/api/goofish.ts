import {useApi} from "./fetch";

export async function isLoginGoofish() {
  const {data, error} = await useApi<boolean>('/api/status/goofish');
  if (error.value) throw error.value
  return !!data.value
}

export async function loginGoofish(json: string) {
  const {error} = await useApi('/api/goofish/state/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({content: json}),
  });
  if (error.value) throw error.value
}

export async function logoutGoofish() {
  const {error} = await useApi('/api/goofish/state/delete', {
    method: 'DELETE',
  });
  if (error.value) throw error.value
}
