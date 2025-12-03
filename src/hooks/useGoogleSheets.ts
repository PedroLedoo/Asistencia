'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readSheetData, SHEETS, GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets'

// Tipos de datos
type Profesor = {
  id: string
  nombre: string
  email: string
  creado_en: string
}

type Curso = {
  id: string
  nombre: string
  profesor_id: string
  creado_en: string
}

type Alumno = {
  id: string
  nombre: string
  apellido: string
  dni: string
  curso_id: string
  creado_en: string
}

type Asistencia = {
  id: string
  alumno_id: string
  fecha: string
  estado: 'presente' | 'ausente' | 'tarde'
  cargado_por: string
  creado_en: string
}

/**
 * Hook para leer datos de Google Sheets
 */
export function useGoogleSheetsData<T>(sheetName: string, enabled: boolean = true) {
  return useQuery<T[]>({
    queryKey: ['google-sheets', sheetName],
    queryFn: async () => {
      if (!GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID) {
        throw new Error('Google Sheet ID no configurado. Ver GOOGLE_SHEETS_SETUP.md')
      }
      const data = await readSheetData(sheetName) as T[]
      
      // Logging para debug (solo en desarrollo)
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`📄 Datos leídos de ${sheetName}:`, {
          total: data.length,
          primeros: data.slice(0, 3)
        })
      }
      
      return data
    },
    enabled: enabled && !!GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
    refetchOnWindowFocus: false,
    staleTime: 0, // Siempre considerar los datos como "stale" para forzar refetch
    gcTime: 0, // No cachear para siempre obtener datos frescos (gcTime reemplaza a cacheTime en React Query v5)
  })
}

/**
 * Hook para obtener todos los cursos desde Google Sheets
 */
export function useCursosFromSheets() {
  const { data: cursos, isLoading } = useGoogleSheetsData<Curso>(SHEETS.CURSOS)
  const { data: profesores } = useGoogleSheetsData<Profesor>(SHEETS.PROFESORES)
  const { data: alumnos } = useGoogleSheetsData<Alumno>(SHEETS.ALUMNOS)

  // Logging para debug (solo en desarrollo)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('📊 Datos de Google Sheets:', {
      cursos: cursos?.length || 0,
      profesores: profesores?.length || 0,
      alumnos: alumnos?.length || 0,
      cursosData: cursos,
    })
  }

  // Combinar datos relacionados
  const cursosConRelaciones = cursos?.map((curso: Curso) => {
    // Normalizar IDs para comparación (pueden venir como string o número)
    const cursoId = String(curso.id || '').trim()
    const profesorId = String(curso.profesor_id || '').trim()
    
    const profesor = profesores?.find((p: Profesor) => String(p.id || '').trim() === profesorId)
    const alumnosDelCurso = alumnos?.filter((a: Alumno) => String(a.curso_id || '').trim() === cursoId) || []
    
    return {
      ...curso,
      id: cursoId, // Asegurar que el ID sea string
      profesores: profesor || null,
      alumnos: alumnosDelCurso
    }
  })

  return {
    data: cursosConRelaciones,
    isLoading
  }
}

/**
 * Hook para obtener un curso específico desde Google Sheets
 */
export function useCursoFromSheets(cursoId: string) {
  const { data: cursos, isLoading } = useCursosFromSheets()
  
  // Normalizar ID para comparación
  const normalizedId = String(cursoId || '').trim()
  
  // Buscar el curso con diferentes estrategias de comparación
  const curso = cursos?.find((c: Curso & { profesores?: Profesor | null, alumnos?: Alumno[] }) => {
    const cursoIdStr = String(c.id || '').trim()
    // Comparación exacta
    if (cursoIdStr === normalizedId) return true
    // Comparación sin espacios
    if (cursoIdStr.replace(/\s/g, '') === normalizedId.replace(/\s/g, '')) return true
    // Comparación case-insensitive
    if (cursoIdStr.toLowerCase() === normalizedId.toLowerCase()) return true
    return false
  })
  
  // Logging para debug (siempre, para ayudar a diagnosticar)
  if (typeof window !== 'undefined') {
    console.log('🔍 Buscando curso:', {
      cursoIdBuscado: normalizedId,
      totalCursos: cursos?.length || 0,
      cursosDisponibles: cursos?.map((c: Curso & { profesores?: Profesor | null, alumnos?: Alumno[] }) => ({ 
        id: c.id, 
        idNormalizado: String(c.id || '').trim(),
        nombre: c.nombre 
      })),
      cursoEncontrado: curso ? { id: curso.id, nombre: curso.nombre } : null,
      coincidencia: curso ? '✅' : '❌'
    })
  }
  
  return {
    data: curso || null,
    isLoading
  }
}

/**
 * Hook para obtener alumnos de un curso desde Google Sheets
 */
export function useAlumnosFromSheets(cursoId?: string) {
  const { data: alumnos, isLoading } = useGoogleSheetsData<Alumno>(SHEETS.ALUMNOS)
  
  const alumnosFiltrados = cursoId 
    ? alumnos?.filter((a: Alumno) => String(a.curso_id || '').trim() === String(cursoId).trim())
    : alumnos

  return {
    data: alumnosFiltrados || [],
    isLoading
  }
}

/**
 * Hook para obtener asistencias desde Google Sheets
 */
export function useAsistenciasFromSheets(cursoId?: string, fecha?: string) {
  const { data: asistencias, isLoading } = useGoogleSheetsData<Asistencia>(SHEETS.ASISTENCIAS)
  const { data: alumnos } = useAlumnosFromSheets(cursoId)

  let asistenciasFiltradas = asistencias || []

  // Filtrar por curso si se especifica
  if (cursoId && alumnos) {
    const alumnosIds = alumnos.map((a: Alumno) => a.id)
    asistenciasFiltradas = asistenciasFiltradas.filter((a: Asistencia) => alumnosIds.includes(a.alumno_id))
  }

  // Filtrar por fecha si se especifica
  if (fecha) {
    asistenciasFiltradas = asistenciasFiltradas.filter((a: Asistencia) => a.fecha === fecha)
  }

  // Combinar con datos de alumnos
  const asistenciasConAlumnos = asistenciasFiltradas.map((asistencia: Asistencia) => {
    const alumno = alumnos?.find((a: Alumno) => a.id === asistencia.alumno_id)
    return {
      ...asistencia,
      alumno: alumno || null
    }
  })

  return {
    data: asistenciasConAlumnos,
    isLoading
  }
}

/**
 * Hook para obtener asistencias por fecha y curso
 */
export function useAsistenciasPorFechaFromSheets(cursoId: string, fecha: string) {
  const { data: alumnos } = useAlumnosFromSheets(cursoId)
  const { data: asistencias } = useAsistenciasFromSheets(cursoId, fecha)

  // Combinar alumnos con sus asistencias
  const resultado = alumnos?.map((alumno: Alumno) => {
    const asistencia = asistencias?.find((a: Asistencia) => a.alumno_id === alumno.id)
    return {
      alumno,
      asistencia: asistencia || null
    }
  }) || []

  return {
    data: resultado,
    isLoading: false
  }
}

/**
 * Función para escribir datos en Google Sheets usando Apps Script
 */
async function writeToSheet(sheetName: string, data: any[]): Promise<void> {
  const appsScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
  
  if (!appsScriptUrl) {
    throw new Error('Google Apps Script URL no configurada. Ver GOOGLE_SHEETS_SETUP.md')
  }

  // Convertir datos a formato de fila
  const headers = Object.keys(data[0] || {})
  const rows = data.map(item => headers.map(header => String(item[header] || '')))

  for (const row of rows) {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sheet: sheetName,
        data: JSON.stringify(row),
        append: 'true'
      })
    })

    if (!response.ok) {
      throw new Error(`Error al escribir en Google Sheets: ${response.statusText}`)
    }
  }
}

/**
 * Hook para crear una asistencia en Google Sheets
 */
export function useCreateAsistenciaInSheets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (asistencia: Omit<Asistencia, 'id' | 'creado_en'>) => {
      const nuevaAsistencia: Asistencia = {
        ...asistencia,
        id: `asist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        creado_en: new Date().toISOString()
      }

      await writeToSheet(SHEETS.ASISTENCIAS, [nuevaAsistencia])
      return nuevaAsistencia
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-sheets', SHEETS.ASISTENCIAS] })
    },
  })
}

/**
 * Hook para crear múltiples asistencias en Google Sheets
 */
export function useCreateAsistenciasBulkInSheets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (asistencias: Omit<Asistencia, 'id' | 'creado_en'>[]) => {
      const nuevasAsistencias: Asistencia[] = asistencias.map((asistencia: Omit<Asistencia, 'id' | 'creado_en'>) => ({
        ...asistencia,
        id: `asist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        creado_en: new Date().toISOString()
      }))

      await writeToSheet(SHEETS.ASISTENCIAS, nuevasAsistencias)
      return nuevasAsistencias
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-sheets', SHEETS.ASISTENCIAS] })
    },
  })
}

