import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import EventAnalyticsCard from './EventAnalyticsCard'

export default function EventTable({ refresh, onEdit, onDelete, onDuplicate }) {
  const [events, setEvents] = useState([])

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date_event', { ascending: true })
    setEvents(data || [])
  }

  useEffect(() => {
    fetchEvents()
  }, [refresh])

  return (
    <div className="space-y-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Nome</th>
            <th className="px-2 py-1 text-left">Data</th>
            <th className="px-2 py-1 text-left">Local</th>
            <th className="px-2 py-1 text-left">Visível</th>
            <th className="px-2 py-1 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id} className="border-t">
              <td className="px-2 py-1">{ev.name}</td>
              <td className="px-2 py-1">{ev.date_event}</td>
              <td className="px-2 py-1">{ev.local}</td>
              <td className="px-2 py-1">{ev.visible ? 'Sim' : 'Não'}</td>
              <td className="px-2 py-1 flex gap-2">
                <button onClick={() => onEdit(ev)}>Editar</button>
                <button onClick={() => onDuplicate(ev)}>Duplicar</button>
                <button onClick={() => onDelete(ev.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(ev => (
          <EventAnalyticsCard key={ev.id} eventId={ev.id} />
        ))}
      </div>
    </div>
  )
}
