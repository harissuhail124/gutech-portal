import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../lib/auth-context'

export default function ProtectedRoute({ role, children }) {
  const { session, profile, loading } = useContext(AuthContext)

  if (loading) return <div className="grid min-h-screen place-items-center text-slate-500">Loading your portal…</div>
  if (!session) return <Navigate to="/" replace />
  if (!profile || profile.role !== role) return <Navigate to="/" replace />

  return children
}
