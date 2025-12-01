'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Alumno = Database['public']['Tables']['alumnos']['Row']
type AlumnoInsert = Database['public']['Tables']['alumnos']['Insert']

export function useAlumnos(cursoId?: string) {
  return useQuery({
    queryKey: ['alumnos', cursoId],
    queryFn: async () => {
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
  })
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
