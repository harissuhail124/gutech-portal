import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthContext } from '../lib/auth-context'

export default function Dashboard({ title, description }) {
  const { profile } = useContext(AuthContext)
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  const fullName = profile?.full_name || 'there'

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <span className="font-bold tracking-tight text-slate-900">GUTECH Portal</span>
          <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Logout
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">{title}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Hello, {fullName}</h1>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
      </section>
    </main>
  )
}
