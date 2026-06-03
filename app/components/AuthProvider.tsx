'use client'

import { createContext, useContext, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthContext = createContext(false)

export function useAuthContext() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const {login} = useAuth()
  

  if (authed) {
    return <AuthContext.Provider value={true}>{children}</AuthContext.Provider>
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({email: process.env.NEXT_PUBLIC_ADMIN_EMAIL!, password})
      setAuthed(true)
    } catch(error) {
      setError(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={false}>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden ">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider">
                Password
            </label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full  rounded-lg px-4 py-3 text-sm focus:outline-none transition-all"
                placeholder="Enter admin password"
                autoFocus
                disabled={loading}
            />
            </div>

            {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-white text-gray-900 font-medium py-3 rounded-lg text-sm hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
            {loading ? 'Verifying…' : 'Sign In'}
            </button>
        </form>
        
      </div>
    </AuthContext.Provider>
  )
}
