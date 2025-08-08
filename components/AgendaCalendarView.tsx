'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Lead } from '@/types'

interface AgendaCalendarViewProps {
  leads: Lead[]
}

export default function AgendaCalendarView({ leads }: AgendaCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const formatAgendaDate = (dateString?: string) => {
    if (!dateString) return { time: '-' }
    try {
      const date = new Date(dateString)
      return {
        time: date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch {
      return { time: '-' }
    }
  }

  // Get first day of month and create calendar grid
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const calendarDays = []
  for (let i = 0; i < 42; i++) {
    const currentCalendarDate = new Date(startDate)
    currentCalendarDate.setDate(startDate.getDate() + i)
    calendarDays.push(currentCalendarDate)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendário de Agendamentos</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium px-4">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 bg-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="bg-gray-100 p-2 text-center font-medium text-gray-700 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString()
            const dayEvents = leads.filter(lead => {
              if (!lead.data_agendamento) return false
              try {
                const eventDate = new Date(lead.data_agendamento)
                return eventDate.toDateString() === day.toDateString()
              } catch {
                return false
              }
            })

            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-20 relative ${
                  isToday ? 'bg-blue-50' : ''
                } ${day.getMonth() !== currentDate.getMonth() ? 'opacity-50' : ''}`}
              >
                <div className="font-medium mb-1 text-sm">{day.getDate()}</div>
                {dayEvents.map((lead, eventIndex) => {
                  const agendaInfo = formatAgendaDate(lead.data_agendamento)
                  return (
                    <div
                      key={eventIndex}
                      className="bg-blue-500 text-white text-xs p-1 rounded mb-1 cursor-pointer hover:bg-blue-600 transition-colors"
                      title={`${lead.nomewpp || 'Sem nome'} - ${agendaInfo.time}`}
                    >
                      <div className="truncate">{lead.nomewpp || 'Sem nome'}</div>
                      <div className="text-xs opacity-75">{agendaInfo.time}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
