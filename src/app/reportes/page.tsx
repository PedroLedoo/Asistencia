'use client'

import { useState } from 'react'
import { useCursos } from '@/hooks/useCursos'
import { useAsistencia } from '@/hooks/useAsistencia'
import { CURRENT_DATA_SOURCE } from '@/lib/data-source'
import { useAsistenciasFromSheets } from '@/hooks/useGoogleSheets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Users, 
  BookOpen,
  ArrowLeft,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { exportToCSV } from '@/lib/utils'

export default function ReportesPage() {
  const { data: cursos, isLoading: cursosLoading } = useCursos()
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [exportando, setExportando] = useState(false)

  // Obtener asistencias del curso seleccionado
  const { data: asistencias, isLoading: asistenciasLoading } = useAsistencia(
    cursoSeleccionado || undefined
  )

  const curso = cursos?.find((c: { id: string }) => c.id === cursoSeleccionado)

  // Exportar todas las asistencias de un curso
  const exportarAsistenciasCompletas = async () => {
    if (!cursoSeleccionado || !curso) {
      alert('Selecciona un curso primero')
      return
    }

    setExportando(true)
    try {
      let data: any[] = []

      // Si estamos usando Google Sheets
      if (CURRENT_DATA_SOURCE === 'google-sheets') {
        const { useAsistenciasFromSheets } = await import('@/hooks/useGoogleSheets')
        // Necesitamos obtener los datos de forma síncrona, así que usamos el hook directamente
        const asistenciasData = asistencias || []
        
        if (asistenciasData.length === 0) {
          alert('No hay asistencias registradas para este curso')
          setExportando(false)
          return
        }

        data = asistenciasData.map((asistencia: any) => ({
          'Curso': curso.nombre,
          'Alumno': asistencia.alumno?.nombre || '',
          'Apellido': asistencia.alumno?.apellido || '',
          'DNI': asistencia.alumno?.dni || '',
          'Fecha': asistencia.fecha,
          'Estado': asistencia.estado ? asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1) : '',
          'Cargado Por': asistencia.cargado_por || '',
          'Fecha de Carga': asistencia.creado_en ? new Date(asistencia.creado_en).toLocaleString('es-AR') : ''
        }))
      } else {
        // Obtener todas las asistencias del curso
        const { supabase, IS_SUPABASE_CONFIGURED } = await import('@/lib/supabase')
        
        if (!IS_SUPABASE_CONFIGURED || !supabase) {
          // Modo local: datos de ejemplo
          const dataEjemplo = [
            {
              'Curso': curso.nombre,
              'Alumno': 'Ejemplo',
              'Apellido': 'Alumno',
              'DNI': '12345678',
              'Fecha': new Date().toISOString().split('T')[0],
              'Estado': 'Presente',
              'Cargado Por': 'Profesor Local',
              'Fecha de Carga': new Date().toLocaleString('es-AR')
            }
          ]
          exportToCSV(dataEjemplo, `asistencias_${curso.nombre}_${new Date().toISOString().split('T')[0]}.csv`)
          setExportando(false)
          return
        }

        const { data: alumnos } = await supabase
          .from('alumnos')
          .select('*')
          .eq('curso_id', cursoSeleccionado)

        if (!alumnos) {
          alert('No se encontraron alumnos')
          setExportando(false)
          return
        }

        const { data: asistenciasData } = await supabase
          .from('asistencias')
          .select(`
            *,
            alumnos (
              nombre,
              apellido,
              dni
            )
          `)
          .in('alumno_id', alumnos.map((a: { id: string }) => a.id))
          .order('fecha', { ascending: false })

        if (!asistenciasData || asistenciasData.length === 0) {
          alert('No hay asistencias registradas para este curso')
          setExportando(false)
          return
        }

        data = asistenciasData.map((asistencia: any) => ({
          'Curso': curso.nombre,
          'Alumno': asistencia.alumnos?.nombre || '',
          'Apellido': asistencia.alumnos?.apellido || '',
          'DNI': asistencia.alumnos?.dni || '',
          'Fecha': asistencia.fecha,
          'Estado': asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1),
          'Cargado Por': asistencia.cargado_por || '',
          'Fecha de Carga': new Date(asistencia.creado_en).toLocaleString('es-AR')
        }))
      }

      if (data.length === 0) {
        alert('No hay datos para exportar')
        setExportando(false)
        return
      }

      exportToCSV(data, `asistencias_${curso.nombre}_${new Date().toISOString().split('T')[0]}.csv`)
      alert('✅ Archivo CSV exportado correctamente. Puedes abrirlo en Google Sheets.')
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar las asistencias: ' + (error as Error).message)
    } finally {
      setExportando(false)
    }
  }

  // Exportar asistencias por rango de fechas
  const exportarAsistenciasPorRango = async () => {
    if (!cursoSeleccionado || !curso) {
      alert('Selecciona un curso primero')
      return
    }

    if (!fechaInicio || !fechaFin) {
      alert('Selecciona un rango de fechas')
      return
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    setExportando(true)
    try {
      const { supabase, IS_SUPABASE_CONFIGURED } = await import('@/lib/supabase')
      
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        alert('Modo local: esta función requiere Supabase configurado')
        setExportando(false)
        return
      }

      const { data: alumnos } = await supabase
        .from('alumnos')
        .select('*')
        .eq('curso_id', cursoSeleccionado)

      if (!alumnos) {
        alert('No se encontraron alumnos')
        setExportando(false)
        return
      }

      const { data: asistenciasData } = await supabase
        .from('asistencias')
        .select(`
          *,
          alumnos (
            nombre,
            apellido,
            dni
          )
        `)
        .in('alumno_id', alumnos.map((a: { id: string }) => a.id))
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: false })

      if (!asistenciasData || asistenciasData.length === 0) {
        alert('No hay asistencias en el rango de fechas seleccionado')
        setExportando(false)
        return
      }

      const data = asistenciasData.map((asistencia: any) => ({
        'Curso': curso.nombre,
        'Alumno': asistencia.alumnos?.nombre || '',
        'Apellido': asistencia.alumnos?.apellido || '',
        'DNI': asistencia.alumnos?.dni || '',
        'Fecha': asistencia.fecha,
        'Estado': asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1),
        'Cargado Por': asistencia.cargado_por || '',
        'Fecha de Carga': new Date(asistencia.creado_en).toLocaleString('es-AR')
      }))

      exportToCSV(
        data, 
        `asistencias_${curso.nombre}_${fechaInicio}_${fechaFin}.csv`
      )
      alert('✅ Archivo CSV exportado correctamente. Puedes abrirlo en Google Sheets.')
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar las asistencias')
    } finally {
      setExportando(false)
    }
  }

  // Exportar lista de alumnos
  const exportarAlumnos = async () => {
    if (!cursoSeleccionado || !curso) {
      alert('Selecciona un curso primero')
      return
    }

    // Necesitamos obtener los datos completos de los alumnos
    const { supabase, IS_SUPABASE_CONFIGURED } = await import('@/lib/supabase')
    
    if (!IS_SUPABASE_CONFIGURED || !supabase) {
      alert('Modo local: esta función requiere Supabase configurado')
      return
    }

    const { data: alumnosCompletos } = await supabase
      .from('alumnos')
      .select('*')
      .eq('curso_id', cursoSeleccionado)

    if (!alumnosCompletos || alumnosCompletos.length === 0) {
      alert('Este curso no tiene alumnos inscriptos')
      return
    }

    const data = alumnosCompletos.map((alumno: { nombre: string, apellido: string, dni: string, creado_en: string }) => ({
      'Curso': curso.nombre,
      'Nombre': alumno.nombre,
      'Apellido': alumno.apellido,
      'DNI': alumno.dni,
      'Fecha de Inscripción': new Date(alumno.creado_en).toLocaleDateString('es-AR')
    }))

    exportToCSV(data, `alumnos_${curso.nombre}_${new Date().toISOString().split('T')[0]}.csv`)
    alert('✅ Archivo CSV exportado correctamente. Puedes abrirlo en Google Sheets.')
  }

  // Exportar resumen de asistencias
  const exportarResumen = async () => {
    if (!cursoSeleccionado || !curso) {
      alert('Selecciona un curso primero')
      return
    }

    setExportando(true)
    try {
      const { supabase, IS_SUPABASE_CONFIGURED } = await import('@/lib/supabase')
      
      if (!IS_SUPABASE_CONFIGURED || !supabase) {
        alert('Modo local: esta función requiere Supabase configurado')
        setExportando(false)
        return
      }

      const { data: alumnos } = await supabase
        .from('alumnos')
        .select('*')
        .eq('curso_id', cursoSeleccionado)

      if (!alumnos || alumnos.length === 0) {
        alert('No se encontraron alumnos')
        setExportando(false)
        return
      }

      const { data: asistenciasData } = await supabase
        .from('asistencias')
        .select('*')
        .in('alumno_id', alumnos.map((a: { id: string }) => a.id))

      if (!asistenciasData) {
        alert('Error al obtener asistencias')
        setExportando(false)
        return
      }

      // Calcular resumen por alumno
      const resumen = alumnos.map((alumno: { id: string, nombre: string, apellido: string, dni: string }) => {
        const asistenciasAlumno = asistenciasData.filter((a: { alumno_id: string }) => a.alumno_id === alumno.id)
        const presentes = asistenciasAlumno.filter((a: { estado: string }) => a.estado === 'presente').length
        const ausentes = asistenciasAlumno.filter((a: { estado: string }) => a.estado === 'ausente').length
        const tardes = asistenciasAlumno.filter((a: { estado: string }) => a.estado === 'tarde').length
        const total = asistenciasAlumno.length
        const porcentaje = total > 0 ? ((presentes + tardes) / total * 100).toFixed(2) : '0.00'

        return {
          'Curso': curso.nombre,
          'Nombre': alumno.nombre,
          'Apellido': alumno.apellido,
          'DNI': alumno.dni,
          'Total Asistencias': total,
          'Presentes': presentes,
          'Ausentes': ausentes,
          'Tardes': tardes,
          'Porcentaje Asistencia': `${porcentaje}%`
        }
      })

      exportToCSV(resumen, `resumen_asistencias_${curso.nombre}_${new Date().toISOString().split('T')[0]}.csv`)
      alert('✅ Archivo CSV exportado correctamente. Puedes abrirlo en Google Sheets.')
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar el resumen')
    } finally {
      setExportando(false)
    }
  }

  // Exportar todos los cursos
  const exportarTodosLosCursos = () => {
    if (!cursos || cursos.length === 0) {
      alert('No tienes cursos creados')
      return
    }

    const data = cursos.map((curso: { id: string; nombre: string; profesores?: { nombre?: string; email?: string } | null; alumnos?: { id: string }[] | null; creado_en: string }) => ({
      'ID': curso.id,
      'Nombre': curso.nombre,
      'Profesor': (curso.profesores as any)?.nombre || '',
      'Email Profesor': (curso.profesores as any)?.email || '',
      'Total Alumnos': curso.alumnos?.length || 0,
      'Fecha de Creación': new Date(curso.creado_en).toLocaleDateString('es-AR')
    }))

    exportToCSV(data, `todos_los_cursos_${new Date().toISOString().split('T')[0]}.csv`)
    alert('✅ Archivo CSV exportado correctamente. Puedes abrirlo en Google Sheets.')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <FileSpreadsheet className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Exportaciones</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Exporta tus datos a CSV para usar en Google Sheets o Excel
        </p>
      </div>

      {/* Exportar todos los cursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Exportar Todos los Cursos
          </CardTitle>
          <CardDescription>
            Genera un archivo CSV con la lista completa de todos tus cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={exportarTodosLosCursos}
            disabled={cursosLoading || !cursos || cursos.length === 0}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Lista de Cursos
          </Button>
        </CardContent>
      </Card>

      {/* Selección de curso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Seleccionar Curso
          </CardTitle>
          <CardDescription>
            Elige un curso para exportar sus datos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="curso">Curso</Label>
              <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
                <SelectTrigger id="curso">
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos?.map((curso: { id: string; nombre: string; alumnos?: { id: string }[] | null }) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.alumnos?.length || 0} alumnos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exportaciones por curso */}
      {cursoSeleccionado && (
        <>
          {/* Exportar alumnos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Exportar Lista de Alumnos
              </CardTitle>
              <CardDescription>
                Genera un archivo CSV con todos los alumnos del curso seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={exportarAlumnos}
                disabled={!curso || !curso.alumnos || curso.alumnos.length === 0}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Alumnos
              </Button>
            </CardContent>
          </Card>

          {/* Exportar asistencias completas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Exportar Todas las Asistencias
              </CardTitle>
              <CardDescription>
                Genera un archivo CSV con todas las asistencias registradas del curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={exportarAsistenciasCompletas}
                disabled={exportando}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportando ? 'Exportando...' : 'Exportar Todas las Asistencias'}
              </Button>
            </CardContent>
          </Card>

          {/* Exportar asistencias por rango */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Exportar Asistencias por Rango de Fechas
              </CardTitle>
              <CardDescription>
                Genera un archivo CSV con las asistencias de un período específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha de Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={exportarAsistenciasPorRango}
                disabled={exportando || !fechaInicio || !fechaFin}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportando ? 'Exportando...' : 'Exportar por Rango de Fechas'}
              </Button>
            </CardContent>
          </Card>

          {/* Exportar resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Exportar Resumen de Asistencias
              </CardTitle>
              <CardDescription>
                Genera un archivo CSV con estadísticas de asistencia por alumno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={exportarResumen}
                disabled={exportando}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportando ? 'Exportando...' : 'Exportar Resumen Estadístico'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instrucciones para Google Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>
                <strong>1. Exporta el archivo CSV</strong> usando los botones de arriba
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>
                <strong>2. Abre Google Sheets</strong> en tu navegador
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>
                <strong>3. Importa el CSV:</strong> Archivo → Importar → Subir → Selecciona el archivo CSV
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>
                <strong>4. O arrastra el archivo</strong> directamente a Google Sheets
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>
                Los archivos CSV son compatibles con Excel, Google Sheets y otros programas de hojas de cálculo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

