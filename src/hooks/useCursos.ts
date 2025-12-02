'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, IS_SUPABASE_CONFIGURED } from '@/lib/supabase'
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
      // Verificar si Supabase está configurado
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        // Modo local: leer de localStorage
        if (typeof window !== 'undefined') {
          const cursosLocales = JSON.parse(localStorage.getItem('cursos_locales') || '[]')
          const storedUser = localStorage.getItem('localUser')
          const user = storedUser ? JSON.parse(storedUser) : null

          // Filtrar cursos del usuario actual si hay usuario
          const cursosFiltrados = user 
            ? cursosLocales.filter((c: any) => c.profesor_id === user.id)
            : cursosLocales

          // Leer alumnos locales también
          const alumnosLocales = JSON.parse(localStorage.getItem('alumnos_locales') || '[]')

          return cursosFiltrados.map((curso: any) => {
            const alumnosDelCurso = alumnosLocales.filter((a: any) => a.curso_id === curso.id)
            return {
              ...curso,
              profesores: user ? { id: user.id, nombre: user.user_metadata?.nombre || user.email, email: user.email } : null,
              alumnos: alumnosDelCurso.map((a: any) => ({ id: a.id }))
            }
          }) as CursoListItem[]
        }
        return []
      }

      // Modo Supabase: usar la base de datos real
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
      // Verificar si Supabase está configurado
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        // Modo local: simular creación y guardar en localStorage
        const nuevoCurso = {
          id: `curso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre: curso.nombre,
          profesor_id: curso.profesor_id,
          creado_en: new Date().toISOString(),
        }

        // Guardar en localStorage para persistencia local
        if (typeof window !== 'undefined') {
          const cursosLocales = JSON.parse(localStorage.getItem('cursos_locales') || '[]')
          cursosLocales.push(nuevoCurso)
          localStorage.setItem('cursos_locales', JSON.stringify(cursosLocales))
        }

        return nuevoCurso as Curso
      }

      // Modo Supabase: usar la base de datos real
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
