import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import PropTypes from 'prop-types'

export const AuthContext = createContext({ user: null, isLoadingUser: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setIsLoadingUser(false)
      return
    }

    try {
      const decoded = jwtDecode(token)
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsLoadingUser(false)
        return
      }

      const cached = localStorage.getItem('user')
      if (cached) {
        try {
          setUser(JSON.parse(cached))
        } catch {
          // ignore malformed cache
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const normalized = {
          id: Number(data.user?.id),
          name: data.user?.name || 'Usuário',
          image: data.user?.photo || '/placeholder.png',
          is_admin: data.user?.is_admin ?? false
        }
        setUser(normalized)
        localStorage.setItem('user', JSON.stringify(normalized))
      }
    } catch (err) {
      console.error('Erro ao obter usuário:', err)
      setUser(null)
    }
    setIsLoadingUser(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const value = useMemo(() => ({ user, isLoadingUser, refreshUser: loadUser }), [user, isLoadingUser, loadUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export const useAuthContext = () => useContext(AuthContext)
