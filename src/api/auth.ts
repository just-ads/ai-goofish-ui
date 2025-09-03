import {saveUserToken} from "@/utils/user";
import {useApi} from './fetch'

export async function login(username: string, password: string) {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const {data, error} = await useApi('/api/login').post(formData).json()
  if (error.value) throw error.value

  if (data.value?.access_token) {
    saveUserToken(data.value.access_token)
  }
  return data.value
}
