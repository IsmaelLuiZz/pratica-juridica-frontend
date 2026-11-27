import { api } from './api'
import type { Assistido, AssistidoCreate } from '../types'
export const assistidos = {
  listar: (signal?: AbortSignal) => api.get<Assistido[]>('/assistidos/', { signal }).then(r => r.data),
  obter: (id: number, signal?: AbortSignal) => api.get<Assistido>(`/assistidos/${id}`, { signal }).then(r => r.data),
  criar: (data: AssistidoCreate) => api.post<Assistido>('/assistidos/', data).then(r => r.data),
}
