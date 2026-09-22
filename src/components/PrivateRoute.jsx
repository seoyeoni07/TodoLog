import { Navigate } from 'react-router-dom'
import { useUser } from '../context/AuthContext'

export function PrivateRoute({ children }) {
  const user = useUser()
  if (user === undefined) return null // loading
  if (!user) return <Navigate to="/login" replace />
  return children
}
