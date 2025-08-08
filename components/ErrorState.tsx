import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
