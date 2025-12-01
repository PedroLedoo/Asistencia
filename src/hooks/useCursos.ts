'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Curso = Database['public']['Tables']['cursos']['Row']
type CursoInsert = Database['public']['Tables']['cursos']['Insert']
type Profesor = Pick<Database['public']['Tables']['profesores']['Row'], 'id' | 'nombre' | 'email'>
type AlumnoResumen = Pick<Database['public']['Tables']['alumnos']['Row'], 'id' | 'nombre' | 'apellido' | 'dni' | 'creado_en'>
type AlumnoListItem = Pick<Database['public']['Tables']['alumnos']['Row'], 'id'>

type CursoListItem = Curso & {
  profesores: Profesor | null
  alumnos: AlumnoListItem[] | null
}

type CursoWithRelations = Curso & {
  profesores: Profesor | null
  alumnos: AlumnoResumen[] | null
}

export function useCursos() {
  return useQuery<CursoListItem[]>({
    queryKey: ['cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          profesores (
            id,
            nombre,
            email
          ),
          alumnos (
            id
          )
        `)
        .order('nombre')

      if (error) throw error
      return data as CursoListItem[]
    },
  })
}

export function useCurso(id: string) {
  return useQuery<CursoWithRelations | null>({
    queryKey: ['curso', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select(`
          *,
          profesores (
            id,
            nombre,
            email
          ),
          alumnos (
            id,
            nombre,
            apellido,
            dni,
            creado_en
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as CursoWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (curso: CursoInsert) => {
      const { data, error } = await supabase
        .from('cursos')
        .insert(curso)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
    },
  })
}

export function useUpdateCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Curso>) => {
      const { data, error } = await supabase
        .from('cursos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      queryClient.invalidateQueries({ queryKey: ['curso', data.id] })
    },
  })
}

export function useDeleteCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
    },
  })
}
