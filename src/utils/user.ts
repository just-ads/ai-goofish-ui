export function getUserToken() {
  return localStorage.getItem("token")
}

export function saveUserToken(token: string) {
  localStorage.setItem("token", token)
}

export function clearUserToken() {
  localStorage.removeItem('token')
}
