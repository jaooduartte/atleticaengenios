import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { ArchiveIcon } from 'lucide-react'
import { useLoading } from '@/context/LoadingContext'
import Loading from '../../components/Loading'
import Head from "next/head";
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../utils/cropImage'
import Image from 'next/image'
import * as react from '@phosphor-icons/react'
import Modal from 'react-modal'
import Header from '../../components/header-admin'
import Footer from '../../components/footer-admin'
import CustomField from '../../components/custom-field'
import CustomButton from '../../components/custom-buttom'
import CustomDropdown from '../../components/custom-dropdown'
import ActionsDropdown from '../../components/ActionsDropdown'
import Banner from '../../components/banner'
import RichTextEditor from '../../components/rich-text-editor.js';
import withAdminProtection from '../../utils/withAdminProtection'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

Modal.setAppElement('#__next')

const eventSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  date_event: z.string().min(1, 'Data obrigatória'),
  local: z.string().optional(),
  image: z.any().optional()
})

function EventsPage() {
  const [events, setEvents] = useState([])
  const { setLoading } = useLoading();
  const [isFetching, setIsFetching] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [banner, setBanner] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [rawImage, setRawImage] = useState(null)
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(eventSchema), defaultValues: { visible: false } })

  const watchedImage = watch('image')

  useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const url = URL.createObjectURL(watchedImage[0])
      setRawImage(url)
      setShowCropModal(true)
    }
  }, [watchedImage])

  const fetchEvents = useCallback(async () => {
    setIsFetching(true)
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)
      const data = await response.json()
      const sortedEvents = (Array.isArray(data) ? data : []).sort((a, b) => {
        if (a.visible === b.visible) {
          return new Date(a.date_event) - new Date(b.date_event)
        }
        return a.visible ? -1 : 1
      })
      setEvents(sortedEvents)
    } catch (err) {
      console.error('Erro ao buscar eventos:', err)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [setLoading])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date_event: '',
    local: '',
    image: undefined
  });
  const openCreateModal = () => {
    document.activeElement?.blur()
    setEditingEvent(null)
    setImagePreview(null)
    reset({
      name: '',
      description: '',
      date_event: '',
      local: '',
      image: undefined
    })
    setFormData({
      name: '',
      description: '',
      date_event: '',
      local: '',
      image: undefined
    });
    setIsModalOpen(true)
  }

  const openEditModal = (event) => {
    document.activeElement?.blur()
    setEditingEvent(event)
    reset({
      name: event.name,
      description: event.description,
      date_event: event.date_event,
      local: event.local
    })
    setFormData({
      ...event,
      description: event.description || '',
    });
    setImagePreview(event.image || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    reset()
    setImagePreview(null)
    setFormData({
      name: '',
      description: '',
      date_event: '',
      local: '',
      image: undefined
    });
  }

  const showBanner = (message, type) => {
    setBanner({ message, type })
    setTimeout(() => setBanner(null), 4500)
  }

  const onSubmit = async (values) => {
    setLoading(true);
    const fd = new FormData()
    fd.append('name', formData.name)
    fd.append('description', formData.description || '')
    fd.append('date_event', formData.date_event)
    fd.append('local', formData.local || '')
    if (!editingEvent && typeof values.visible !== 'undefined') {
      fd.append('visible', values.visible)
    }
    if (croppedImage) {
      try {
        const response = await fetch(croppedImage)
        const blob = await response.blob()
        const file = new File([blob], 'cropped-image.png', { type: 'image/png' })
        fd.append('image', file)
      } catch (e) {
        console.error('Erro ao processar imagem recortada', e)
      }
    } else if (values.image && values.image[0]) {
      fd.append('image', values.image[0])
    }

    const url = editingEvent
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/events/${editingEvent.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/events`
    const method = editingEvent ? 'PUT' : 'POST'

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Erro ao salvar evento')

      showBanner(editingEvent ? 'Evento atualizado!' : 'Evento criado!', 'success')
      closeModal()
      fetchEvents()
      setCroppedImage(null)
    } catch (err) {
      console.error(err)
      showBanner('Erro ao salvar evento', 'error')
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      showBanner('Evento excluído', 'success')
      fetchEvents()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false);
    }
  }

  const handleDuplicate = async (event) => {
    setLoading(true);
    try {
      let fileBlob = null
      if (event.image) {
        const res = await fetch(event.image)
        fileBlob = await res.blob()
      }

      const formData = new FormData()
      formData.append('name', `${event.name} (Cópia)`)
      formData.append('description', event.description || '')
      formData.append('date_event', event.date_event)
      formData.append('local', event.local || '')
      formData.append('visible', event.visible)
      if (fileBlob) {
        const fileName = event.image.split('/').pop() || 'image.png'
        formData.append('image', new File([fileBlob], fileName, { type: fileBlob.type }))
      }

      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      showBanner('Evento duplicado', 'success')
      fetchEvents()
    } catch (err) {
      console.error(err)
      showBanner('Erro ao duplicar evento', 'error')
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility =
      visibilityFilter === '' ||
      (visibilityFilter === 'true' ? event.visible : !event.visible);
    const isPast = new Date(event.date_event) < new Date();
    const matchesDate = showPastEvents ? isPast : !isPast;
    return matchesSearch && matchesVisibility && matchesDate;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.visible === b.visible) {
      return new Date(a.date_event) - new Date(b.date_event);
    }
    return a.visible ? -1 : 1;
  });
  const toggleVisibility = async (event) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !event.visible })
      })
      if (!response.ok) throw new Error('Erro ao atualizar visibilidade')
      fetchEvents()
      showBanner(event.visible ? 'Evento inativado com sucesso' : 'Evento ativado com sucesso', 'success')
    } catch (err) {
      console.error(err)
      showBanner('Erro ao atualizar visibilidade', 'error')
    } finally {
      setLoading(false);
    }
  }

  if (isFetching) {
    return <Loading />
  }

  return (
    <>
      <Head>
        <title>Eventos | Área Admin</title>
      </Head>
      <div className="events-page flex flex-col min-h-screen bg-white text-black dark:bg-[#0e1117] dark:text-white transition-colors duration-500 ease-in-out">
        <Header />
        {banner && <Banner type={banner.type} message={banner.message} />}
        <div className="container mx-auto p-6 flex-grow">
          <h1 className="text-5xl font-bold mb-10 mt-4 text-center text-gray-800 dark:text-white">
            Gestão de Eventos
          </h1>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex w-full items-center gap-4">
              <div className="w-full max-w-xs">
                <CustomField
                  icon={react.MagnifyingGlassIcon}
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome..."
                  clearable={!!searchTerm}
                  onClear={() => setSearchTerm('')}
                />
              </div>
              <div className="w-full max-w-xs">
                <CustomDropdown
                  value={visibilityFilter}
                  onChange={setVisibilityFilter}
                  options={[
                    { label: 'Todos', value: '' },
                    { label: 'Visíveis', value: 'true' },
                    { label: 'Ocultos', value: 'false' }
                  ]}
                  placeholder="Filtrar por visibilidade"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                title={showPastEvents ? "Ocultar eventos passados" : "Exibir eventos passados"}
                onClick={() => setShowPastEvents((prev) => !prev)}
                className={clsx(
                  'rounded-full p-2 flex items-center justify-center transition-all duration-200',
                  showPastEvents
                    ? 'bg-red-900 text-white'
                    : 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
                )}
              >
                <ArchiveIcon size={25} />
              </Button>
            </div>
            <div>
              <CustomButton
                className="bg-red-700 hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800 w-fit px-6 py-2 justify-end"
                onClick={openCreateModal}
              >
                <span className="flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                  <react.PlusIcon size={18} /> Adicionar evento
                </span>
              </CustomButton>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedEvents.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-red-900 dark:text-red-400 rounded-xl px-8 py-12 text-center text-base max-w-2xl mx-auto mt-12 animate-fade-in space-y-4">
                <react.WarningCircleIcon size={64} />
                <h3 className="text-2xl font-semibold">Nenhum evento encontrado</h3>
                <p className="text-sm">Verifique se digitou corretamente o nome do evento ou experimente outros termos para a busca.</p>
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative bg-white dark:bg-white/10 dark:border dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-between transition-transform hover:scale-[1.02] shadow-md animate-fade-in"
                >
                  <div className="absolute top-3 right-2 z-10">
                    <ActionsDropdown
                      items={[
                        {
                          label: 'Editar',
                          icon: react.PencilSimple,
                          onClick: () => openEditModal(event)
                        },
                        {
                          label: 'Duplicar',
                          icon: react.Copy,
                          onClick: () => handleDuplicate(event)
                        },
                        {
                          label: event.visible ? 'Inativar' : 'Ativar',
                          icon: react.Eye,
                          onClick: () => toggleVisibility(event)
                        },
                        {
                          label: 'Excluir',
                          icon: react.Trash,
                          onClick: () => handleDelete(event.id)
                        }
                      ]}
                    />
                  </div>
                  <div className="p-2 w-full">
                    <div className="w-full h-36 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.name}
                          width={320}
                          height={144}
                          className="object-cover w-full h-36 rounded-md"
                          priority={true}
                        />
                      ) : (
                        <span className="text-sm text-gray-500">Sem imagem</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-1">{event.name}</h3>
                  <p className="text-sm text-center text-gray-600 dark:text-gray-300">{new Date(event.date_event).toLocaleDateString()}</p>
                  <p className="text-sm text-center text-gray-600 dark:text-gray-300">{event.local}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-200">Status:</span>
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${event.visible ? 'bg-green-500' : 'bg-red-500'}`}
                      title={event.visible ? 'Ativo' : 'Inativo'}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showCropModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
            <div className="bg-white dark:bg-[#0e1117] p-6 rounded-md w-[90vw] max-w-3xl h-[60vh] relative flex flex-col">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={940 / 360}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
                <CustomButton
                  type="button"
                  className="!bg-gray-500 hover:!bg-gray-600"
                  onClick={() => {
                    setShowCropModal(false);
                    setRawImage(null);
                    setCroppedImage(null);
                  }}
                >
                  Cancelar
                </CustomButton>
                <CustomButton
                  type="button"
                  className="!bg-red-800 hover:!bg-red-700"
                  onClick={async () => {
                    const cropped = await getCroppedImg(rawImage, croppedAreaPixels);
                    setImagePreview(cropped);
                    setCroppedImage(cropped);
                    setShowCropModal(false);
                    setRawImage(null);
                  }}
                >
                  Salvar
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          shouldCloseOnOverlayClick={true}
          overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
          className="relative bg-white dark:bg-[#0e1117] dark:backdrop-blur-xl text-gray-800 p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto border-t-[6px] border-[#B3090F] dark:border-red-600 transform transition-all duration-300 ease-in-out"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
          <h2 className="text-2xl mb-6 text-center font-bold text-[#B3090F] dark:text-red-600">
            {editingEvent ? 'Editar Evento' : 'Adicionar Evento'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative group w-full max-w-xs">
                {imagePreview && (
                  <div className="w-full aspect-[3/1] relative mb-4 rounded-md overflow-hidden border border-gray-600">
                    <Image
                      src={imagePreview}
                      alt="Pré-visualização"
                      layout="fill"
                      objectFit="cover"
                      priority={true}
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div className="w-full aspect-[3/1] rounded-md bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 text-sm border border-gray-600 mb-4">
                    Sem imagem
                  </div>
                )}
                <label
                  htmlFor="eventImage"
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm bg-white/40 dark:bg-[#0e1117]/40"
                  style={{ zIndex: 2 }}
                >
                  <react.CameraIcon size={24} className="text-[#B3090F]" />
                  <input id="eventImage" type="file" accept="image/*" {...register('image')} hidden />
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold pl-2 dark:text-white/70" htmlFor="name">
                Nome do evento
              </label>
              <CustomField name="name" {...register('name')} isInvalid={!!errors.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold pl-2 dark:text-white/70" htmlFor="date_event">
                  Data do evento
                </label>
                <CustomField
                  label="Data do evento"
                  type="date"
                  placeholder="Selecione a data"
                  {...register("date_event")}
                  value={watch("date_event")}
                  className={`text-sm ${watch("date_event")
                    ? "text-foreground"
                    : "text-muted-foreground"
                    }`}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold pl-2 dark:text-white/70" htmlFor="local">
                  Local
                </label>
                <CustomField name="local" {...register('local')} />
              </div>
            </div>
            <div>
              <label className="block mb-2 pl-2 dark:text-white/70 font-semibold" htmlFor="description">
                Descrição
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, description: value }))
                }
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <CustomButton
                type="submit"
                disabled={isSubmitting}
                className={`!bg-red-800 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-700 dark:hover:!bg-red-700'}`}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </CustomButton>
            </div>
          </form>
        </Modal>
        <Footer />
        <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
        <style>{`
        .shadow-bright-red {
          box-shadow: 0 0 18px rgba(255, 0, 0, 0.5);
        }
        .shadow-bright-orange {
          box-shadow: 0 0 18px rgba(255, 165, 0, 0.5);
        }
      `}</style>
      </div>
    </>
  )
}

export default withAdminProtection(EventsPage)

function Button({ variant, size, title, onClick, children, className }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        className ||
        `items-center p-2 rounded-full text-sm shadow-sm transition-all duration-200 ${variant === "outline"
          ? "bg-red-900 text-white shadow-[0_0_12px_rgba(255,0,0,0.7)]"
          : "text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"
        }`
      }
      style={
        size === "icon"
          ? {
            width: 36,
            height: 36,
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }
          : {}
      }
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};