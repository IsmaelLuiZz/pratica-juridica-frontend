import { useEffect, useState, type ReactNode } from 'react'
import { carregarSessao, salvarSessao } from '../services/api'
import type { Sessao } from '../types'
import { AuthContext } from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState(carregarSessao)
  function entrar(value: Sessao) { salvarSessao(value); setUsuario(value) }
  function sair() { salvarSessao(null); setUsuario(null) }
  useEffect(() => {
    if (!usuario) return
    const timer = window.setTimeout(sair, Math.max(0, usuario.exp * 1000 - Date.now()))
    return () => window.clearTimeout(timer)
  }, [usuario])
  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>
}
