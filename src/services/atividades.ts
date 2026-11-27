import { api } from './api'
import type { Atividade, AtividadeCreate, AtividadeUpdate } from '../types'
export const atividades = {
  listar: (signal?: AbortSignal) => api.get<Atividade[]>('/atividades/', { signal }).then(r => r.data),
  criar: (data: AtividadeCreate) => api.post<Atividade>('/atividades/', data).then(r => r.data),
  atualizar: (id: number, data: AtividadeUpdate) => api.patch<Atividade>(`/atividades/${id}`, data).then(r => r.data),
}
