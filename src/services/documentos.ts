import { api, listarPaginado } from './api'
import type { Documento, DocumentoCreate } from '../types'
export const documentos = {
  listar: (signal?: AbortSignal) => listarPaginado<Documento>('/documentos/', signal),
  criar: (data: DocumentoCreate) => api.post<Documento>('/documentos/', data).then(r => r.data),
}

export function statusDocumento(item: Documento) {
  return Array.from(item.tipo.matchAll(/\[(APROVADO|REJEITADO_AJUSTES)\]/g)).at(-1)?.[1] ?? 'PENDENTE'
}
