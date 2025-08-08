export interface Lead {
  id: number
  nomewpp?: string
  telefone?: string
  telefone_limpo?: string
  email?: string
  origem_lead?: string
  status_atendimento?: string
  etapa_funil?: string
  pontuacao_lead?: number
  data_agendamento?: string
  resumo_atendimento?: string
  created_at?: string
  agendamento?: boolean
  is_duplicate?: boolean
  duplicate_count?: number
}

export interface Prompt {
  id: number
  titulo: string
  categoria: string
  descricao?: string
  conteudo: string
  status: 'ativo' | 'inativo'
  prioridade: 'alta' | 'media' | 'baixa'
  created_at?: string
}

export interface ApiError {
  message: string
  endpoint?: string
  status?: number
  response?: string
}
