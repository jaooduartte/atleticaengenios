import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useLoading } from '../context/LoadingContext'

export default function useRouteLoader() {
  const router = useRouter()
  const { setLoading } = useLoading()

  useEffect(() => {
    const start = () => setLoading(true)
    const end = () => setLoading(false)

    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', end)
    router.events.on('routeChangeError', end)

    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', end)
      router.events.off('routeChangeError', end)
    }
  }, [router, setLoading])
}
