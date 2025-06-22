import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../lib/supabaseClient'
import { useState, useEffect } from 'react'
import Banner from './banner'
import { Input } from './ui/input'
import { Button } from './ui/button'

const eventSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  date_event: z.string().min(1, 'Data obrigatória'),
  local: z.string().optional(),
  image: z.any().optional(),
  visible: z.boolean().default(false)
})



export default function EventForm({ onCreated, initialValues }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { visible: false }
  })
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues])

  const onSubmit = async values => {
    setLoading(true)
    let imagePath = null
    if (values.image && values.image.length > 0) {
      const file = values.image[0]
      const ext = file.name.split('.').pop();
      const sanitized = file.name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `event-${Date.now()}-${sanitized}`;
      const { data, error } = await supabase.storage.from('event-images').upload(fileName, file);
      if (error) {
        console.error(error)
      } else {
        imagePath = `event-images/${data.path}`
      }
    }

    let error
    if (initialValues?.id) {
      const result = await supabase.from('events').update({
        name: values.name,
        description: values.description,
        date_event: values.date_event,
        local: values.local,
        image: imagePath || initialValues.image,
        visible: values.visible
      }).eq('id', initialValues.id)
      error = result.error
    } else {
      const result = await supabase.from('events').insert({
        name: values.name,
        description: values.description,
        date_event: values.date_event,
        local: values.local,
        image: imagePath,
        visible: values.visible
      })
      error = result.error
    }

    setLoading(false)
    if (!error) {
      setBanner({ message: 'Evento criado!', type: 'success' })
      reset()
      onCreated && onCreated()
    } else {
      console.error(error)
      setBanner({ message: 'Erro ao criar evento', type: 'error' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Nome" {...register('name')} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <Input placeholder="Descrição" {...register('description')} />
      </div>
      <div>
        <Input type="date" {...register('date_event')} />
        {errors.date_event && <p className="text-sm text-red-600">{errors.date_event.message}</p>}
      </div>
      <div>
        <Input placeholder="Local" {...register('local')} />
      </div>
      <div>
        <Input type="file" {...register('image')} />
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" {...register('visible')} id="visible" />
        <label htmlFor="visible">Visível</label>
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Evento'}</Button>
      {banner && <Banner message={banner.message} type={banner.type} />}
    </form>
  )
}
