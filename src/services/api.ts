import axios from 'axios'
import type { Sessao } from '../types'

const key = 'pratica-juridica.sessao'
export function carregarSessao(): Sessao | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? 'null') as Sessao | null
    return value && value.exp * 1000 > Date.now() && value.token ? value : null
  } catch { return null }
}
export function salvarSessao(value: Sessao | null) {
  if (value) sessionStorage.setItem(key, JSON.stringify(value))
  else sessionStorage.removeItem(key)
}

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', timeout: 15000 })
api.interceptors.request.use(config => {
  const token = carregarSessao()?.token
  if (token && config.url !== '/auth/login') config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
    const current = carregarSessao()
    if (!current || error.config?.headers?.get('Authorization') === `Bearer ${current.token}`) {
      salvarSessao(null)
      window.location.replace('/login')
    }
  }
  return Promise.reject(error)
})

export function mensagemErro(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map(item => `${item.loc?.slice(1).join('.')}: ${item.msg}`).join(' · ')
    return error.response ? `A API retornou um erro (${error.response.status}).` : 'Não foi possível acessar a API. Verifique a conexão e o endereço configurado.'
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

export async function listarPaginado<T>(path: string, signal?: AbortSignal) {
  const registros: T[] = []
  const limit = 100
  for (let skip = 0; ; skip += limit) {
    const { data } = await api.get<T[]>(path, { params: { skip, limit }, signal })
    registros.push(...data)
    if (data.length < limit) return registros
  }
}
