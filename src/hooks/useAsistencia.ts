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
      // Si estamos usando Google Sheets
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
        
        if (!appsScriptUrl) {
          throw new Error('Google Apps Script URL no configurada. Necesitas configurar NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL para escribir datos.')
        }

        // Primero, eliminar asistencias existentes para estas fechas y alumnos (para evitar duplicados)
        // Agrupamos por fecha y eliminamos todas las asistencias de esa fecha para esos alumnos
        const fechasUnicas = [...new Set(asistencias.map(a => a.fecha))]
        
        for (const fecha of fechasUnicas) {
          // Obtener todos los alumnos que tienen asistencia en esta fecha
          const alumnosEnFecha = asistencias
            .filter(a => a.fecha === fecha)
            .map(a => a.alumno_id)
          
          // Eliminar asistencias existentes para esta fecha y estos alumnos
          // Usamos deleteByFields para eliminar por alumno_id Y fecha
          for (const alumnoId of alumnosEnFecha) {
            await fetch(appsScriptUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                action: 'deleteByFields',
                sheet: 'Asistencias',
                fields: JSON.stringify(['alumno_id', 'fecha']),
                values: JSON.stringify([alumnoId, fecha])
              })
            }).catch(() => {
              // Ignorar errores si no existe
            })
          }
        }

        // Crear nuevas asistencias
        const nuevasAsistencias = asistencias.map(asistencia => ({
          id: asistencia.id || `asist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          alumno_id: asistencia.alumno_id,
          fecha: asistencia.fecha,
          estado: asistencia.estado,
          cargado_por: asistencia.cargado_por,
          creado_en: asistencia.creado_en || new Date().toISOString()
        }))

        // Escribir cada asistencia
        for (const asistencia of nuevasAsistencias) {
          const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              sheet: 'Asistencias',
              data: JSON.stringify([
                asistencia.id,
                asistencia.alumno_id,
                asistencia.fecha,
                asistencia.estado,
                asistencia.cargado_por,
                asistencia.creado_en
              ]),
              append: 'true'
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error al escribir asistencia en Google Sheets: ${errorText}`)
          }
        }

        return nuevasAsistencias as any
      }

      // Modo local
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        if (typeof window !== 'undefined') {
          const asistenciasLocales = JSON.parse(localStorage.getItem('asistencias_locales') || '[]')
          
          // Eliminar asistencias existentes para estos alumnos y fechas
          const nuevasAsistencias = asistencias.map(a => ({
            id: a.id || `asist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...a,
            creado_en: a.creado_en || new Date().toISOString()
          }))

          // Filtrar asistencias existentes y agregar nuevas
          const asistenciasFiltradas = asistenciasLocales.filter((a: any) => {
            return !nuevasAsistencias.some(na => na.alumno_id === a.alumno_id && na.fecha === a.fecha)
          })

          asistenciasFiltradas.push(...nuevasAsistencias)
          localStorage.setItem('asistencias_locales', JSON.stringify(asistenciasFiltradas))
        }
        return asistencias as any
      }

      // Modo Supabase
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
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Asistencias'] })
        queryClient.invalidateQueries({ queryKey: ['asistencias', 'curso'] })
      }
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
