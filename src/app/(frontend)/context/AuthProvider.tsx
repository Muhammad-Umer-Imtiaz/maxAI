'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  email: string
  firstName: string
  lastName: string
  plan: 'free' | 'starter' | 'proFit' | 'maxFlex'
  aiCallsUsed: number
  maxAiCalls: number // This should match the field in your database
  // add other fields you want
}

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('payload-token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/users/me', {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data?.user || null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
      })
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      localStorage.removeItem('payload-token')
      setUser(null)
      window.location.href = '/' // optional: force refresh to clear auth state
    }
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
