'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, IS_SUPABASE_CONFIGURED } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { CURRENT_DATA_SOURCE } from '@/lib/data-source'
import { useCursosFromSheets, useCursoFromSheets } from './useGoogleSheets'

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
  // Siempre llamar ambos hooks, pero solo usar uno según la fuente de datos
  const sheetsData = useCursosFromSheets()
  
  const supabaseQuery = useQuery<CursoListItem[]>({
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

export function useCurso(id: string) {
  // Siempre llamar ambos hooks, pero solo usar uno según la fuente de datos
  const sheetsData = useCursoFromSheets(id)
  
  const supabaseQuery = useQuery<CursoWithRelations | null>({
    queryKey: ['curso', id],
    queryFn: async () => {
      // Verificar si Supabase está configurado
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        // Modo local: leer de localStorage
        if (typeof window !== 'undefined') {
          const cursosLocales = JSON.parse(localStorage.getItem('cursos_locales') || '[]')
          const curso = cursosLocales.find((c: any) => c.id === id)
          
          if (!curso) return null

          const storedUser = localStorage.getItem('localUser')
          const user = storedUser ? JSON.parse(storedUser) : null

          // Leer alumnos locales
          const alumnosLocales = JSON.parse(localStorage.getItem('alumnos_locales') || '[]')
          const alumnosDelCurso = alumnosLocales.filter((a: any) => a.curso_id === id)

          return {
            ...curso,
            profesores: user ? { id: user.id, nombre: user.user_metadata?.nombre || user.email, email: user.email } : null,
            alumnos: alumnosDelCurso.map((a: any) => ({
              id: a.id,
              nombre: a.nombre,
              apellido: a.apellido,
              dni: a.dni,
              creado_en: a.creado_en
            }))
          } as CursoWithRelations
        }
        return null
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
    enabled: !!id && CURRENT_DATA_SOURCE !== 'google-sheets',
  })

  // Retornar datos según la fuente activa
  if (CURRENT_DATA_SOURCE === 'google-sheets') {
    return {
      data: sheetsData.data || null,
      isLoading: sheetsData.isLoading,
      error: null,
    } as any
  }

  return supabaseQuery
}

export function useCreateCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (curso: CursoInsert) => {
      // Si estamos usando Google Sheets
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
        
        if (!appsScriptUrl) {
          throw new Error('Google Apps Script URL no configurada. Necesitas configurar NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL para escribir datos.')
        }

        const nuevoCurso = {
          id: `curso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre: curso.nombre || '',
          profesor_id: curso.profesor_id || '',
          creado_en: new Date().toISOString(),
        }

        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            sheet: 'Cursos',
            data: JSON.stringify([
              nuevoCurso.id,
              nuevoCurso.nombre,
              nuevoCurso.profesor_id,
              nuevoCurso.creado_en,
            ]),
            append: 'true'
          })
        })

        // Leer la respuesta
        const responseText = await response.text()
        
        if (!response.ok) {
          console.error('Error de respuesta de Apps Script:', {
            status: response.status,
            statusText: response.statusText,
            responseText
          })
          throw new Error(`Error al escribir curso en Google Sheets (${response.status}): ${responseText}`)
        }

        // Verificar que la respuesta sea exitosa (puede ser JSON o texto)
        try {
          const result = JSON.parse(responseText)
          if (result.success === false) {
            throw new Error(result.error || 'Error desconocido al escribir en Google Sheets')
          }
          console.log('Curso creado exitosamente en Google Sheets:', result)
        } catch (parseError) {
          // Si no es JSON válido, verificar si es un mensaje de éxito
          if (responseText.includes('success') || responseText.includes('correctamente')) {
            console.log('Curso creado exitosamente en Google Sheets')
          } else {
            console.warn('Respuesta inesperada de Apps Script:', responseText)
          }
        }

        return nuevoCurso as Curso
      }

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      queryClient.invalidateQueries({ queryKey: ['curso', data.id] })
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Cursos'] })
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Alumnos'] })
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Profesores'] })
      }
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
      // Si estamos usando Google Sheets
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
        
        if (!appsScriptUrl) {
          throw new Error('Google Apps Script URL no configurada. Necesitas configurar NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL para eliminar datos.')
        }

        // Eliminar curso
        const responseCurso = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            action: 'deleteByField',
            sheet: 'Cursos',
            field: 'id',
            value: id
          })
        })

        if (!responseCurso.ok) {
          const errorData = await responseCurso.text()
          throw new Error(`Error al eliminar curso: ${errorData}`)
        }

        // También eliminar alumnos asociados
        const responseAlumnos = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            action: 'deleteByField',
            sheet: 'Alumnos',
            field: 'curso_id',
            value: id
          })
        })

        // No lanzar error si no hay alumnos (puede que no existan)
        if (!responseAlumnos.ok) {
          console.warn('Advertencia al eliminar alumnos asociados:', await responseAlumnos.text())
        }

        // Eliminar asistencias asociadas (primero necesitamos los IDs de los alumnos)
        // Por ahora, eliminamos por curso_id indirectamente
        // Esto requiere una mejora en el Apps Script o leer primero los alumnos
        
        return
      }

      // Verificar si Supabase está configurado
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        // Modo local: eliminar de localStorage
        if (typeof window !== 'undefined') {
          const cursosLocales = JSON.parse(localStorage.getItem('cursos_locales') || '[]')
          const cursosFiltrados = cursosLocales.filter((c: any) => c.id !== id)
          localStorage.setItem('cursos_locales', JSON.stringify(cursosFiltrados))

          // También eliminar alumnos asociados
          const alumnosLocales = JSON.parse(localStorage.getItem('alumnos_locales') || '[]')
          const alumnosFiltrados = alumnosLocales.filter((a: any) => a.curso_id !== id)
          localStorage.setItem('alumnos_locales', JSON.stringify(alumnosFiltrados))

          // Eliminar asistencias asociadas
          const asistenciasLocales = JSON.parse(localStorage.getItem('asistencias_locales') || '[]')
          const alumnosIds = alumnosLocales.filter((a: any) => a.curso_id === id).map((a: any) => a.id)
          const asistenciasFiltradas = asistenciasLocales.filter((a: any) => !alumnosIds.includes(a.alumno_id))
          localStorage.setItem('asistencias_locales', JSON.stringify(asistenciasFiltradas))
        }
        return
      }

      // Modo Supabase: usar la base de datos real
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Cursos'] })
        queryClient.invalidateQueries({ queryKey: ['google-sheets', 'Alumnos'] })
      }
    },
  })
}
