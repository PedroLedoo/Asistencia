'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, IS_SUPABASE_CONFIGURED } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Modo local sin Supabase: usamos un usuario de prueba guardado en localStorage
    if (!IS_SUPABASE_CONFIGURED) {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('localUser')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setUser(parsed)
          } catch {
            // ignorar errores de parseo
          }
        }
      }
      setLoading(false)
      return
    }

    // Modo normal con Supabase (solo si está realmente configurado)
    if (!supabase) {
      setLoading(false)
      return
    }

    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Modo local: no usar Supabase, aceptar credenciales de prueba
    if (!IS_SUPABASE_CONFIGURED) {
      // credenciales de prueba del README
      if (email === 'profesor@cpfp6.edu.ar' && password === '123456') {
        const fakeUser: User = {
          id: 'local-user',
          email,
          app_metadata: {},
          user_metadata: { nombre: 'Profesor Local' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User

        setUser(fakeUser)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('localUser', JSON.stringify(fakeUser))
        }

        return { data: { user: fakeUser }, error: null as any }
      }

      return {
        data: null,
        error: new Error('Credenciales inválidas (modo local sin Supabase)') as any,
      }
    }

    // Modo normal con Supabase (solo si está realmente configurado)
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase no está configurado correctamente') as any,
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, nombre: string) => {
    if (!IS_SUPABASE_CONFIGURED || !supabase) {
      // En modo local, simulamos un registro exitoso pero no persistimos nada real
      return {
        data: null,
        error: null,
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!IS_SUPABASE_CONFIGURED || !supabase) {
      setUser(null)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('localUser')
      }
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
