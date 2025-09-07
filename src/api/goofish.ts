import {useApi} from "./fetch";

export async function isLoginGoofish() {
  return useApi('/api/status/goofish');
}

export async function loginGoofish(json: any) {
  return useApi('/api/state/save', {
    method: 'POST',
    body: JSON.stringify(json),
  })
}

export async function logoutGoofish() {
  return useApi('/api/state/delete', {
    method: 'DELETE',
  })
}
