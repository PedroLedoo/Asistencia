'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, IS_SUPABASE_CONFIGURED } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { CURRENT_DATA_SOURCE } from '@/lib/data-source'
import { useAlumnosFromSheets } from './useGoogleSheets'

type Alumno = Database['public']['Tables']['alumnos']['Row']
type AlumnoInsert = Database['public']['Tables']['alumnos']['Insert']

export function useAlumnos(cursoId?: string) {
  // Siempre llamar ambos hooks, pero solo usar uno según la fuente de datos
  const sheetsData = useAlumnosFromSheets(cursoId)
  
  const supabaseQuery = useQuery({
    queryKey: ['alumnos', cursoId],
    queryFn: async () => {
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        // Modo local: leer de localStorage
        if (typeof window !== 'undefined') {
          const alumnosLocales = JSON.parse(localStorage.getItem('alumnos_locales') || '[]')
          const alumnosFiltrados = cursoId 
            ? alumnosLocales.filter((a: any) => a.curso_id === cursoId)
            : alumnosLocales
          return alumnosFiltrados.map((a: any) => ({
            ...a,
            cursos: { id: a.curso_id, nombre: 'Curso Local' }
          }))
        }
        return []
      }

      let query = supabase
        .from('alumnos')
        .select(`
          *,
          cursos (
            id,
            nombre
          )
        `)
        .order('apellido')

      if (cursoId) {
        query = query.eq('curso_id', cursoId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: CURRENT_DATA_SOURCE !== 'google-sheets',
  })

  // Retornar datos según la fuente activa
  if (CURRENT_DATA_SOURCE === 'google-sheets') {
    return {
      data: sheetsData.data || [],
      isLoading: sheetsData.isLoading,
      error: null,
    } as any
  }

  return supabaseQuery
}

export function useAlumno(id: string) {
  return useQuery({
    queryKey: ['alumno', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumnos')
        .select(`
          *,
          cursos (
            id,
            nombre,
            profesores (
              nombre
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateAlumno() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alumno: AlumnoInsert) => {
      // Si estamos usando Google Sheets
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
        
        if (!appsScriptUrl) {
          throw new Error('Google Apps Script URL no configurada. Necesitas configurar NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL para escribir datos.')
        }

        const nuevoAlumno = {
          id: `alumno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre: alumno.nombre || '',
          apellido: alumno.apellido || '',
          dni: alumno.dni || '',
          curso_id: alumno.curso_id || '',
          creado_en: new Date().toISOString(),
        }

        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            sheet: 'Alumnos',
            data: JSON.stringify([
              nuevoAlumno.id,
              nuevoAlumno.nombre,
              nuevoAlumno.apellido,
              nuevoAlumno.dni,
              nuevoAlumno.curso_id,
              nuevoAlumno.creado_en,
            ]),
            append: 'true'
          })
        })

        if (!response.ok) {
          throw new Error(`Error al escribir en Google Sheets: ${response.statusText}`)
        }

        return nuevoAlumno as any
      }

      // Modo local
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        const nuevoAlumno = {
          id: `alumno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...alumno,
          creado_en: new Date().toISOString(),
        }

        if (typeof window !== 'undefined') {
          const alumnosLocales = JSON.parse(localStorage.getItem('alumnos_locales') || '[]')
          alumnosLocales.push(nuevoAlumno)
          localStorage.setItem('alumnos_locales', JSON.stringify(alumnosLocales))
        }

        return nuevoAlumno as any
      }

      // Modo Supabase
      const { data, error } = await supabase
        .from('alumnos')
        .insert(alumno)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      queryClient.invalidateQueries({ queryKey: ['alumnos', data.curso_id] })
      queryClient.invalidateQueries({ queryKey: ['curso', data.curso_id] })
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Alumnos'] })
      }
    },
  })
}

export function useUpdateAlumno() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Alumno>) => {
      const { data, error } = await supabase
        .from('alumnos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      queryClient.invalidateQueries({ queryKey: ['alumnos', data.curso_id] })
      queryClient.invalidateQueries({ queryKey: ['alumno', data.id] })
      queryClient.invalidateQueries({ queryKey: ['curso', data.curso_id] })
    },
  })
}

export function useDeleteAlumno() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Primero obtenemos el alumno para invalidar las queries correctas
      const { data: alumno } = await supabase
        .from('alumnos')
        .select('curso_id')
        .eq('id', id)
        .single()

      const { error } = await supabase
        .from('alumnos')
        .delete()
        .eq('id', id)

      if (error) throw error
      return alumno
    },
    onSuccess: (alumno) => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      if (alumno) {
        queryClient.invalidateQueries({ queryKey: ['alumnos', alumno.curso_id] })
        queryClient.invalidateQueries({ queryKey: ['curso', alumno.curso_id] })
      }
    },
  })
}
