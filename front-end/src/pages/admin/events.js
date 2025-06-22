import { supabase } from '../../lib/supabaseClient'
import Header from '../../components/header-admin'
import Footer from '../../components/footer-admin'
import withAdminProtection from '../../utils/withAdminProtection'
import EventForm from '../../components/EventForm'
import EventTable from '../../components/EventTable'
import Head from 'next/head'
import { useState } from 'react'

function AdminEventsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingEvent, setEditingEvent] = useState(null)

  const refresh = () => setRefreshKey(k => k + 1)
  const handleEdit = (event) => setEditingEvent(event)
  const handleClearEdit = () => setEditingEvent(null)

  const handleDuplicate = async (event) => {
    const { id, created_at, ...rest } = event
    await supabase.from('events').insert({
      ...rest,
      name: event.name + ' (Cópia)',
      created_at: new Date().toISOString()
    })
    refresh()
  }

  const handleDelete = async (id) => {
    await supabase.from('events').delete().eq('id', id)
    refresh()
  }

  return (
    <div>
      <Header />
      <Head>
        <title>Eventos | Área Admin</title>
      </Head>
      <main className="p-4 space-y-8 dark:bg-[#0e1117] bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Criar novo evento</h2>
          <EventForm onCreated={() => { refresh(); handleClearEdit() }} initialValues={editingEvent} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Eventos</h2>
          <EventTable
            refresh={refreshKey}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default withAdminProtection(AdminEventsPage)
