import { api } from './api'
import type { LoginResponse, Perfil, Sessao } from '../types'

export async function login(email: string, password: string): Promise<Sessao> {
  const { data } = await api.post<LoginResponse>('/auth/login', new URLSearchParams({ username: email, password }))
  const body = data.access_token.split('.')[1]
  const { sub, exp, perfil } = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/'))) as { sub: string; exp: number; perfil: Perfil }
  const id = Number(sub)
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isFinite(exp) || exp * 1000 <= Date.now() ||
      !['ALUNO', 'PROFESSOR', 'ADMIN'].includes(perfil) || perfil !== data.perfil) throw new Error('A API retornou uma sessão inválida.')
  return { id, exp, perfil, nome: data.nome, token: data.access_token }
}
