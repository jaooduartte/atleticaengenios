import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card } from './ui/card'

export default function EventAnalyticsCard({ eventId }) {
  const [stats, setStats] = useState(null)

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('views_events')
      .select('user_id, viewed_at')
      .eq('event_id', eventId)

    if (!error) {
      const total_views = data.length
      let last_viewed_at = null
      if (data.length > 0) {
        last_viewed_at = data.reduce((acc, curr) => acc > curr.viewed_at ? acc : curr.viewed_at, data[0].viewed_at)
      }
      const unique_viewers = new Set(data.map(d => d.user_id)).size
      setStats({ total_views, last_viewed_at, unique_viewers })
    }
  }

  useEffect(() => {
    fetchStats()
  }, [eventId])

  if (!stats) return null

  return (
    <Card className="p-4">
      <p>Total de visualizações: {stats.total_views}</p>
      <p>Última visualização: {stats.last_viewed_at ? new Date(stats.last_viewed_at).toLocaleString() : '-'}</p>
      <p>Visitantes únicos: {stats.unique_viewers}</p>
    </Card>
  )
}
