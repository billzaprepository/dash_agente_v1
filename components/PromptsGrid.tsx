'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Copy, Edit, Trash2, Files } from 'lucide-react'
import { Prompt } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface PromptsGridProps {
  prompts: Prompt[]
  onEdit: (prompt: Prompt) => void
  onDelete: (promptId: number) => void
  onToggleStatus: (promptId: number) => void
  onDuplicate: (prompt: Prompt) => void
}

export default function PromptsGrid({ 
  prompts, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onDuplicate 
}: PromptsGridProps) {
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const extractVariables = (content: string) => {
    const regex = /\{([^}]+)\}/g
    const variables = []
    let match
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }
    return variables
  }

  const highlightVariables = (content: string) => {
    return content.replace(/\{([^}]+)\}/g, '<span class="bg-yellow-200 text-yellow-800 px-1 rounded text-xs font-semibold">{$1}</span>')
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const toggleExpanded = (promptId: number) => {
    const newExpanded = new Set(expandedPrompts)
    if (newExpanded.has(promptId)) {
      newExpanded.delete(promptId)
    } else {
      newExpanded.add(promptId)
    }
    setExpandedPrompts(newExpanded)
  }

  const copyPromptContent = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.conteudo)
      toast({
        title: "Sucesso",
        description: "Conteúdo copiado para a área de transferência!"
      })
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao copiar conteúdo",
        variant: "destructive"
      })
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'alta': { variant: 'destructive' as const, text: '🔥 Alta' },
      'media': { variant: 'default' as const, text: '⚡ Média' },
      'baixa': { variant: 'secondary' as const, text: '🌱 Baixa' }
    }
    const config = variants[priority as keyof typeof variants] || { variant: 'secondary' as const, text: 'Sem prioridade' }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  if (prompts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">🤖</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prompt encontrado</h3>
        <p className="text-gray-500 mb-4">Crie seu primeiro prompt para começar.</p>
        <Button>➕ Criar Primeiro Prompt</Button>
      </Card>
    )
  }

  // Sort prompts: active first, then by priority
  const sortedPrompts = [...prompts].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'ativo' ? -1 : 1
    }
    const priorityOrder = { 'alta': 0, 'media': 1, 'baixa': 2 }
    return priorityOrder[a.prioridade] - priorityOrder[b.prioridade]
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedPrompts.map((prompt) => {
        const variables = extractVariables(prompt.conteudo || '')
        const isExpanded = expandedPrompts.has(prompt.id)
        const preview = isExpanded ? prompt.conteudo : truncateText(prompt.conteudo || '', 150)
        const priorityClass = `border-l-4 ${
          prompt.prioridade === 'alta' ? 'border-l-red-500' :
          prompt.prioridade === 'media' ? 'border-l-yellow-500' :
          'border-l-green-500'
        }`
        const statusClass = prompt.status === 'inativo' ? 'opacity-70' : ''

        return (
          <Card key={prompt.id} className={`${priorityClass} ${statusClass} hover:shadow-lg transition-all`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {prompt.titulo || 'Sem título'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={prompt.status === 'ativo' ? 'default' : 'secondary'}>
                      {prompt.status === 'ativo' ? '✅ Ativo' : '⏸️ Inativo'}
                    </Badge>
                    <Badge variant="outline">{prompt.categoria || 'Sem categoria'}</Badge>
                    {getPriorityBadge(prompt.prioridade)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(prompt.id)}
                    title={prompt.status === 'ativo' ? 'Desativar' : 'Ativar'}
                  >
                    {prompt.status === 'ativo' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDuplicate(prompt)}
                    title="Duplicar"
                  >
                    <Files className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(prompt)}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(prompt.id)}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {prompt.descricao && (
                <p className="text-sm text-gray-600 mb-3">{prompt.descricao}</p>
              )}

              <div className="mb-3">
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: highlightVariables(preview || '') }} />
                  {(prompt.conteudo || '').length > 150 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleExpanded(prompt.id)}
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 ml-2"
                    >
                      {isExpanded ? 'Ver menos' : 'Ver mais...'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>{(prompt.conteudo || '').length} caracteres</span>
                  <span>{variables.length} variáveis</span>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => copyPromptContent(prompt)}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                  title="Copiar conteúdo"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
