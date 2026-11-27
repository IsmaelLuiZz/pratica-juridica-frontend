import { api, listarPaginado } from './api'
import type { Prazo, PrazoCreate } from '../types'
export const prazos = {
  listar: (signal?: AbortSignal) => listarPaginado<Prazo>('/prazos/', signal),
  criar: (data: PrazoCreate) => api.post<Prazo>('/prazos/', data).then(r => r.data),
}
