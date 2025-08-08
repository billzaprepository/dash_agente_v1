import { Lead, Prompt, ApiError } from '@/types'

// API Configuration
const API_URL = 'https://n8n.billzap.com.br/webhook/consulta-tabelas-agente-v8'
const DELETE_API_URL = 'https://n8n.billzap.com.br/webhook/deletar-dados-dash'
const EDIT_API_URL = 'https://n8n.billzap.com.br/webhook/editar-lead-dash'

const PROMPTS_APIS = {
  CONSULTAR: 'https://n8n.billzap.com.br/webhook/consulta-prompts',
  CRIAR: 'https://n8n.billzap.com.br/webhook/criar-prompt',
  EDITAR: 'https://n8n.billzap.com.br/webhook/editar-prompt',
  DELETAR: 'https://n8n.billzap.com.br/webhook/deletar-prompt'
}

// Utility functions
export function processLeadsData(rawData: any[]): Lead[] {
  console.log('Processando dados dos leads...')
  return rawData.map(lead => ({
    ...lead,
    id: Number(lead.id),
    telefone: cleanPhone(lead.telefone),
    telefone_limpo: cleanPhoneForComparison(lead.telefone),
    nomewpp: lead.nomewpp?.trim() || null,
    email: lead.email?.trim() || null,
    pontuacao_lead: lead.pontuacao_lead ? Number(lead.pontuacao_lead) : null,
    agendamento: lead.agendamento === true || lead.agendamento === "true",
    data_agendamento: lead.data_agendamento || null,
    is_duplicate: false,
    duplicate_count: 1
  }))
}

export function cleanPhone(phone?: string): string | null {
  if (!phone) return null
  return phone.replace(/@s\.whatsapp\.net$/, '').trim()
}

export function cleanPhoneForComparison(phone?: string): string {
  if (!phone) return ''
  return phone.replace(/@s\.whatsapp\.net$/, '').replace(/\D/g, '')
}

export function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  } else if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function isValidEmail(email?: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// API Functions
export async function fetchLeadsData(): Promise<Lead[]> {
  console.log('=== BUSCANDO LEADS ===')
  console.log('URL:', API_URL)
  
  let response: Response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    })

    console.log('Status da resposta (leads):', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na resposta (leads):', errorText)
      throw new ApiError(`Erro na API de leads: ${response.status} - ${errorText.substring(0, 100)}`)
    }

    const rawData = await response.json()
    console.log('Dados de leads recebidos:', rawData)

    const processedLeads = processLeadsData(Array.isArray(rawData) ? rawData : [])
    console.log('Leads processados:', processedLeads.length)

    return processedLeads

  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    throw error
  }
}

export async function fetchPromptsData(): Promise<Prompt[]> {
  console.log('=== BUSCANDO PROMPTS ===')
  console.log('URL:', PROMPTS_APIS.CONSULTAR)
  
  // Estratégias em ordem de prioridade
  const strategies = [
    {
      name: 'POST padrão',
      method: 'POST' as const,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString() })
    },
    {
      name: 'POST simples',
      method: 'POST' as const,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    },
    {
      name: 'GET simples',
      method: 'GET' as const,
      headers: { 'Accept': 'application/json' }
    },
    {
      name: 'POST sem headers',
      method: 'POST' as const,
      headers: {},
      body: JSON.stringify({ action: 'consultar' })
    }
  ]

  let lastError: Error | null = null
  
  for (const strategy of strategies) {
    try {
      console.log(`Tentando estratégia: ${strategy.name}`)
      
      const options: RequestInit = {
        method: strategy.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dashboard-Leads/1.0',
          ...strategy.headers
        }
      }

      if ('body' in strategy && strategy.method !== 'GET') {
        options.body = strategy.body
      }

      const response = await fetch(PROMPTS_APIS.CONSULTAR, options)
      console.log(`Status da resposta (${strategy.name}):`, response.status)

      if (response.ok) {
        const rawData = await response.json()
        console.log('Dados de prompts recebidos:', rawData)
        
        // Processar os dados recebidos
        let promptsArray: Prompt[] = []
        if (Array.isArray(rawData)) {
          promptsArray = rawData
        } else if (rawData && Array.isArray(rawData.data)) {
          promptsArray = rawData.data
        } else if (rawData && typeof rawData === 'object') {
          promptsArray = [rawData]
        }
        
        console.log(`✅ Prompts carregados com sucesso usando ${strategy.name}:`, promptsArray.length)
        return promptsArray
      }

      const errorText = await response.text()
      lastError = new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`)
      
    } catch (error) {
      console.error(`Erro na estratégia ${strategy.name}:`, error)
      lastError = error as Error
      continue
    }
  }
  
  // Se chegou aqui, todas as estratégias falharam
  console.error('Todas as estratégias falharam. Último erro:', lastError)
  throw lastError || new Error('Não foi possível conectar ao endpoint de prompts')
}

export async function deleteLeads(leads: Lead[], type: 'single' | 'bulk' | 'all'): Promise<void> {
  let titulo: string
  let deleteData: any

  switch(type) {
    case 'all':
      titulo = "excluir TODOS os Leads"
      deleteData = { titulo }
      break
    case 'bulk':
    case 'single':
      titulo = "excluir leads"
      deleteData = {
        titulo,
        tipo: type,
        quantidade: leads.length,
        timestamp: new Date().toISOString(),
        leads
      }
      break
  }

  console.log('Enviando dados para exclusão:', deleteData)

  const response = await fetch(DELETE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deleteData)
  })

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`)
  }

  const result = await response.json()
  console.log('Resposta da API:', result)
}

export async function editLead(leadId: number, originalLead: Lead, changedFields: Partial<Lead>, leadCompleto: Lead): Promise<void> {
  const editData = {
    titulo: "editar lead",
    leadId,
    dadosOriginais: originalLead,
    dadosAlterados: changedFields,
    leadCompleto,
    timestamp: new Date().toISOString(),
  }

  console.log('Enviando dados para edição:', editData)

  const response = await fetch(EDIT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(editData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na API: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log('Resposta da API de edição:', result)
}

// Prompt API functions
export async function createPrompt(promptData: Omit<Prompt, 'id' | 'created_at'>): Promise<Prompt> {
  const response = await fetch(PROMPTS_APIS.CRIAR, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      ...promptData,
      timestamp: new Date().toISOString()
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na API: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return {
    id: result.id || Date.now(),
    ...promptData,
    created_at: new Date().toISOString()
  }
}

export async function updatePrompt(promptId: number, promptData: Partial<Prompt>): Promise<void> {
  const response = await fetch(PROMPTS_APIS.EDITAR, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      promptId,
      ...promptData,
      timestamp: new Date().toISOString()
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na API: ${response.status} - ${errorText}`)
  }
}

export async function deletePrompt(promptId: number): Promise<void> {
  const response = await fetch(PROMPTS_APIS.DELETAR, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      promptId,
      timestamp: new Date().toISOString()
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na API: ${response.status} - ${errorText}`)
  }
}

class ApiError extends Error {
  endpoint?: string
  status?: number
  response?: string

  constructor(message: string, endpoint?: string, status?: number, response?: string) {
    super(message)
    this.name = 'ApiError'
    this.endpoint = endpoint
    this.status = status
    this.response = response
  }
}
