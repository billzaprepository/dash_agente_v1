'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Phone, Mail, User } from 'lucide-react'
import { Lead } from '@/types'
import { formatPhone } from '@/lib/api'

interface AgendaListViewProps {
  leads: Lead[]
}

export default function AgendaListView({ leads }: AgendaListViewProps) {
  const formatAgendaDate = (dateString?: string) => {
    if (!dateString || dateString.trim() === '') return { date: '-', time: '-', dayName: '-' }

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return { date: 'Data inválida', time: '-', dayName: '-' }

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      let dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' })
      if (date.toDateString() === today.toDateString()) {
        dayName = 'Hoje'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        dayName = 'Amanhã'
      }

      return {
        date: date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1)
      }
    } catch {
      return { date: 'Data inválida', time: '-', dayName: '-' }
    }
  }

  const getAgendaCardClass = (dateString?: string) => {
    if (!dateString || dateString.trim() === '') return ''

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      today.setHours(0, 0, 0, 0)
      tomorrow.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)

      if (date.getTime() === today.getTime()) {
        return 'border-l-4 border-l-green-500 bg-green-50'
      } else if (date.getTime() === tomorrow.getTime()) {
        return 'border-l-4 border-l-yellow-500 bg-yellow-50'
      } else if (date < today) {
        return 'border-l-4 border-l-gray-500 bg-gray-50 opacity-80'
      }
      return 'border-l-4 border-l-blue-500'
    } catch {
      return ''
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Sem status</Badge>

    const variants = {
      'Convertido': 'default' as const,
      'Em andamento': 'secondary' as const,
      'Perdido': 'destructive' as const,
      'Qualificado': 'outline' as const
    }

    const variant = variants[status as keyof typeof variants] || 'secondary'
    return <Badge variant={variant}>{status}</Badge>
  }

  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
        <p className="text-gray-500">Não há reuniões agendadas com os filtros selecionados.</p>
      </Card>
    )
  }

  // Sort by date
  const sortedLeads = [...leads].sort((a, b) => {
    try {
      const dateA = new Date(a.data_agendamento || 0)
      const dateB = new Date(b.data_agendamento || 0)
      return dateA.getTime() - dateB.getTime()
    } catch {
      return 0
    }
  })

  return (
    <div className="space-y-4">
      {sortedLeads.map((lead) => {
        const agendaInfo = formatAgendaDate(lead.data_agendamento)
        const cardClass = getAgendaCardClass(lead.data_agendamento)

        return (
          <Card key={lead.id} className={`${cardClass} hover:shadow-lg transition-all`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lead.nomewpp || 'Nome não informado'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(lead.status_atendimento)}
                        {lead.origem_lead && (
                          <Badge variant="outline">{lead.origem_lead}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Contato
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Telefone:</strong> {formatPhone(lead.telefone)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {lead.email || 'Não informado'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Informações do Lead
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Etapa:</strong> {lead.etapa_funil || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Pontuação:</strong> {lead.pontuacao_lead || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {lead.resumo_atendimento && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">📝 Resumo do Atendimento</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {lead.resumo_atendimento}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ml-6 text-right">
                  <div className="mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {agendaInfo.time}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {agendaInfo.dayName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {agendaInfo.date}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
