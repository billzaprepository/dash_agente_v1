'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { Lead } from '@/types'
import { formatPhone } from '@/lib/api'

interface LeadsTableProps {
  leads: Lead[]
  selectedLeads: Set<number>
  onSelectionChange: (selected: Set<number>) => void
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
}

export default function LeadsTable({ 
  leads, 
  selectedLeads, 
  onSelectionChange, 
  onEdit, 
  onDelete 
}: LeadsTableProps) {
  const [selectAll, setSelectAll] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      onSelectionChange(new Set(leads.map(lead => lead.id)))
    } else {
      onSelectionChange(new Set())
    }
  }

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads)
    if (checked) {
      newSelected.add(leadId)
    } else {
      newSelected.delete(leadId)
    }
    onSelectionChange(newSelected)
    setSelectAll(newSelected.size === leads.length)
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Pontuação</TableHead>
            <TableHead>Agendamento</TableHead>
            <TableHead>Duplicatas</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Checkbox
                  checked={selectedLeads.has(lead.id)}
                  onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {lead.nomewpp || 'Nome não informado'}
                {lead.is_duplicate && (
                  <span className="text-xs text-orange-600 ml-2">(mesclado)</span>
                )}
              </TableCell>
              <TableCell>{formatPhone(lead.telefone)}</TableCell>
              <TableCell className="max-w-xs truncate">{lead.email || '-'}</TableCell>
              <TableCell>
                <Badge variant="outline">{lead.origem_lead || 'N/A'}</Badge>
              </TableCell>
              <TableCell>{getStatusBadge(lead.status_atendimento)}</TableCell>
              <TableCell>{lead.etapa_funil || '-'}</TableCell>
              <TableCell>
                {lead.pontuacao_lead ? (
                  <div className="flex items-center gap-2">
                    <Progress value={lead.pontuacao_lead} className="w-12" />
                    <span className="text-sm">{lead.pontuacao_lead}</span>
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell>
                {lead.data_agendamento ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(lead.data_agendamento)}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                {lead.is_duplicate ? (
                  <Badge variant="outline" className="text-orange-600">
                    {lead.duplicate_count}x
                  </Badge>
                ) : (
                  <Badge variant="secondary">Único</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(lead)}
                    title="Editar lead"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(lead)}
                    title="Excluir lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
