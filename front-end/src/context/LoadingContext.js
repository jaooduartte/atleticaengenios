import { createContext, useContext, useState, useMemo } from 'react'
import PropTypes from 'prop-types'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)

  const value = useMemo(() => ({ loading, setLoading }), [loading])

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)

LoadingProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
