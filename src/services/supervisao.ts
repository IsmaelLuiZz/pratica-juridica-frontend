import { api } from './api'
import type { SupervisaoResponse, SupervisaoUpdate } from '../types'
export const supervisionar = (id: number, data: SupervisaoUpdate) =>
  api.patch<SupervisaoResponse>(`/supervisao/documentos/${id}/aprovar`, data).then(r => r.data)
