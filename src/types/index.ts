export type Perfil = 'ALUNO' | 'PROFESSOR' | 'ADMIN'
export interface LoginResponse { access_token: string; token_type: 'bearer'; perfil: Perfil; nome: string }
export interface Sessao { id: number; nome: string; perfil: Perfil; exp: number; token: string }
export interface Aluno { id: number; nome: string; email: string; perfil: 'aluno'; ativo: boolean; criado_em: string }
export interface AssistidoCreate { nome: string; cpf: string; telefone?: string | null; email?: string | null; endereco?: string | null; observacoes?: string | null }
export interface Assistido extends AssistidoCreate { id: number; criado_em: string }
export interface CasoCreate { titulo: string; descricao: string; status?: string | null; assistido_id: number; aluno_id: number; professor_id: number }
export interface Caso extends CasoCreate { id: number; criado_em: string }
export interface AtendimentoCreate { relato: string; caso_juridico_id: number; assistido_id: number; aluno_id: number }
export interface Atendimento extends AtendimentoCreate { id: number; data_hora: string; deletado_em?: string | null }
export interface AtividadeCreate { descricao: string; caso_juridico_id: number; responsavel_id: number }
export interface Atividade extends AtividadeCreate { id: number; status: string; criado_em: string }
export interface AtividadeUpdate { descricao?: string; status?: 'PENDENTE' | 'CONCLUIDO' }
export interface PrazoCreate { descricao: string; data_vencimento: string; status?: string | null; caso_juridico_id: number }
export interface Prazo extends PrazoCreate { id: number; criado_em: string }
export interface DocumentoCreate { titulo: string; tipo: string; caminho_arquivo?: string | null; descricao?: string | null; caso_juridico_id: number }
export interface Documento extends DocumentoCreate { id: number; data_criacao: string }
export interface SupervisaoUpdate { status: 'APROVADO' | 'REJEITADO_AJUSTES'; observacoes_professor?: string }
export interface SupervisaoResponse { mensagem: string; documento_id: number; status_atual: SupervisaoUpdate['status']; observacoes: string | null }
