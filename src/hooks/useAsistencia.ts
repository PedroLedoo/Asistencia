'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, IS_SUPABASE_CONFIGURED } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { CURRENT_DATA_SOURCE } from '@/lib/data-source'
import { useAsistenciasFromSheets, useAsistenciasPorFechaFromSheets } from './useGoogleSheets'

type Asistencia = Database['public']['Tables']['asistencias']['Row']
type AsistenciaInsert = Database['public']['Tables']['asistencias']['Insert']
type Alumno = Database['public']['Tables']['alumnos']['Row']

type AsistenciaPorFecha = {
  alumno: Alumno
  asistencia: Asistencia | null
}

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
  // Siempre llamar ambos hooks, pero solo usar uno según la fuente de datos
  const sheetsData = useAsistenciasPorFechaFromSheets(cursoId, fecha)
  
  const supabaseQuery = useQuery<AsistenciaPorFecha[]>({
    queryKey: ['asistencias', 'curso', cursoId, 'fecha', fecha],
    queryFn: async () => {
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        // Modo local: leer de localStorage
        if (typeof window !== 'undefined') {
          const alumnosLocales = JSON.parse(localStorage.getItem('alumnos_locales') || '[]')
          const alumnosDelCurso = alumnosLocales.filter((a: any) => a.curso_id === cursoId)
          const asistenciasLocales = JSON.parse(localStorage.getItem('asistencias_locales') || '[]')
          
          return alumnosDelCurso.map((alumno: any) => {
            const asistencia = asistenciasLocales.find(
              (a: any) => a.alumno_id === alumno.id && a.fecha === fecha
            )
            return {
              alumno,
              asistencia: asistencia || null
            }
          })
        }
        return []
      }

      // Primero obtenemos todos los alumnos del curso
      const { data: alumnos, error: alumnosError } = await supabase
        .from('alumnos')
        .select('*')
        .eq('curso_id', cursoId)
        .order('apellido')

      if (alumnosError) throw alumnosError
      if (!alumnos) return []

      // Luego obtenemos las asistencias para esa fecha
      const { data: asistencias, error: asistenciasError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', fecha)
        .in('alumno_id', alumnos.map((a: Alumno) => a.id))

      if (asistenciasError) throw asistenciasError

      // Combinamos los datos
      const resultado: AsistenciaPorFecha[] = alumnos.map((alumno: Alumno) => {
        const asistencia = asistencias?.find((a: Asistencia) => a.alumno_id === alumno.id)
        return {
          alumno,
          asistencia: asistencia || null
        }
      })

      return resultado
    },
    enabled: !!(cursoId && fecha) && CURRENT_DATA_SOURCE !== 'google-sheets',
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
