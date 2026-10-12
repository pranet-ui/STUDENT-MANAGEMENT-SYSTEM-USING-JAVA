const BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD
  ? 'https://student-management-system-using-java-production.up.railway.app/api'
  : 'http://localhost:8080/api')

export function getToken() { return localStorage.getItem('edupilot_token') }

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${BASE}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`)
  return data
}
