import { api } from './api'
import type { Aluno, Caso, CasoCreate } from '../types'
export const casos = {
  listar: (signal?: AbortSignal) => api.get<Caso[]>('/casos/', { signal }).then(r => r.data),
  obter: (id: number, signal?: AbortSignal) => api.get<Caso>(`/casos/${id}`, { signal }).then(r => r.data),
  criar: (data: CasoCreate) => api.post<Caso>('/casos/', data).then(r => r.data),
  alunos: (signal?: AbortSignal) => api.get<Aluno[]>('/alunos/', { signal }).then(r => r.data),
}
