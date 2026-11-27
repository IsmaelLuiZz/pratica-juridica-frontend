import { createContext, useContext } from 'react'
import type { Sessao } from '../types'
export const AuthContext = createContext<{ usuario: Sessao | null; entrar: (session: Sessao) => void; sair: () => void } | null>(null)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('Sessão indisponível.')
  return context
}
