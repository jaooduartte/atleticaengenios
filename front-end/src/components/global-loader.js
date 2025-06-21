import { Loader2 } from 'lucide-react'
import { useLoading } from '../context/LoadingContext'

export default function GlobalLoader() {
  const { loading } = useLoading()

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Loader2 className="h-10 w-10 animate-spin text-red-600" />
    </div>
  )
}
