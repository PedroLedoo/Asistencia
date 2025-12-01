'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Asistencia = Database['public']['Tables']['asistencias']['Row']
type AsistenciaInsert = Database['public']['Tables']['asistencias']['Insert']

export function useAsistencia(cursoId?: string, fecha?: string) {
  return useQuery({
    queryKey: ['asistencias', cursoId, fecha],
    queryFn: async () => {
      let query = supabase
        .from('asistencias')
        .select(`
          *,
          alumnos (
            id,
            nombre,
            apellido,
            dni,
            cursos (
              id,
              nombre
            )
          ),
          profesores:cargado_por (
            nombre
          )
        `)
        .order('creado_en', { ascending: false })

      if (cursoId && fecha) {
        // Obtener asistencias específicas de un curso y fecha
        query = query
          .eq('alumnos.curso_id', cursoId)
          .eq('fecha', fecha)
      } else if (cursoId) {
        // Obtener todas las asistencias de un curso
        query = query.eq('alumnos.curso_id', cursoId)
      } else if (fecha) {
        // Obtener todas las asistencias de una fecha
        query = query.eq('fecha', fecha)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!(cursoId || fecha),
  })
}

export function useAsistenciasAlumno(alumnoId: string) {
  return useQuery({
    queryKey: ['asistencias', 'alumno', alumnoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          alumnos (
            nombre,
            apellido,
            cursos (
              nombre
            )
          )
        `)
        .eq('alumno_id', alumnoId)
        .order('fecha', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!alumnoId,
  })
}

export function useAsistenciasPorFecha(cursoId: string, fecha: string) {
  return useQuery({
    queryKey: ['asistencias', 'curso', cursoId, 'fecha', fecha],
    queryFn: async () => {
      // Primero obtenemos todos los alumnos del curso
      const { data: alumnos, error: alumnosError } = await supabase
        .from('alumnos')
        .select('*')
        .eq('curso_id', cursoId)
        .order('apellido')

      if (alumnosError) throw alumnosError

      // Luego obtenemos las asistencias para esa fecha
      const { data: asistencias, error: asistenciasError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', fecha)
        .in('alumno_id', alumnos.map(a => a.id))

      if (asistenciasError) throw asistenciasError

      // Combinamos los datos
      const resultado = alumnos.map(alumno => {
        const asistencia = asistencias.find(a => a.alumno_id === alumno.id)
        return {
          alumno,
          asistencia: asistencia || null
        }
      })

      return resultado
    },
    enabled: !!(cursoId && fecha),
  })
}

export function useCreateAsistencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (asistencia: AsistenciaInsert) => {
      const { data, error } = await supabase
        .from('asistencias')
        .insert(asistencia)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
    },
  })
}

export function useCreateAsistenciasBulk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (asistencias: AsistenciaInsert[]) => {
      const { data, error } = await supabase
        .from('asistencias')
        .upsert(asistencias, {
          onConflict: 'alumno_id,fecha'
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
    },
  })
}

export function useUpdateAsistencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Asistencia>) => {
      const { data, error } = await supabase
        .from('asistencias')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
    },
  })
}

export function useDeleteAsistencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('asistencias')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
    },
  })
}
