'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCurso } from '@/hooks/useCursos'
import { useAsistenciasPorFecha, useCreateAsistenciasBulk, useAsistencia } from '@/hooks/useAsistencia'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Save, Users, CheckCircle, XCircle, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function AsistenciaPage() {
  const params = useParams()
  const cursoId = params.id as string
  const { user } = useAuth()
  
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [asistencias, setAsistencias] = useState<Record<string, 'presente' | 'ausente' | 'tarde'>>({})
  
  const { data: curso, isLoading: cursoLoading } = useCurso(cursoId)
  const { data: asistenciaData, isLoading: asistenciaLoading } = useAsistenciasPorFecha(cursoId, fecha)
  const { data: asistenciasCurso } = useAsistencia(cursoId)
  const createAsistenciasBulk = useCreateAsistenciasBulk()

  // Sincronizar el estado local cuando cambian las asistencias de la fecha seleccionada
  useEffect(() => {
    if (!asistenciaData) return

    const nuevasAsistencias: Record<string, 'presente' | 'ausente' | 'tarde'> = {}
    asistenciaData.forEach(({ alumno, asistencia }) => {
      nuevasAsistencias[alumno.id] = asistencia?.estado || 'presente'
    })
    setAsistencias(nuevasAsistencias)
  }, [asistenciaData])

  const handleAsistenciaChange = (alumnoId: string, estado: 'presente' | 'ausente' | 'tarde') => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: estado
    }))
  }

  const setAllAsistencias = (estado: 'presente' | 'ausente' | 'tarde') => {
    if (!asistenciaData) return
    
    const nuevasAsistencias: Record<string, 'presente' | 'ausente' | 'tarde'> = {}
    asistenciaData.forEach(({ alumno }) => {
      nuevasAsistencias[alumno.id] = estado
    })
    setAsistencias(nuevasAsistencias)
  }

  const handleGuardar = async () => {
    if (!user || !asistenciaData) return

    const asistenciasArray = asistenciaData.map(({ alumno }) => ({
      alumno_id: alumno.id,
      fecha,
      estado: asistencias[alumno.id] || 'presente',
      cargado_por: user.id
    }))

    try {
      await createAsistenciasBulk.mutateAsync(asistenciasArray)
      alert('Asistencias guardadas exitosamente')
    } catch (error) {
      alert('Error al guardar las asistencias')
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'presente':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ausente':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'tarde':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />
    }
  }

  if (cursoLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Curso no encontrado</h2>
      </div>
    )
  }

  // Fechas con asistencia registrada (para el calendario)
  const fechasRegistradas = new Set(
    (asistenciasCurso || []).map((a) => a.fecha)
  )

  const currentDate = new Date(fecha)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-11
  const diasEnMes = new Date(year, month + 1, 0).getDate()

  const primerDiaSemana = (() => {
    const d = new Date(year, month, 1)
    // getDay(): 0 = domingo, 1 = lunes, ...
    const day = d.getDay()
    // Convertimos a 0 = lunes, 6 = domingo
    return (day + 6) % 7
  })()

  const celdasCalendario: (number | null)[] = []
  for (let i = 0; i < primerDiaSemana; i++) {
    celdasCalendario.push(null)
  }
  for (let dia = 1; dia <= diasEnMes; dia++) {
    celdasCalendario.push(dia)
  }

  const cambiarMes = (delta: number) => {
    const base = new Date(fecha)
    base.setDate(1)
    base.setMonth(base.getMonth() + delta)
    const nuevaFecha =
      `${base.getFullYear()}-` +
      `${String(base.getMonth() + 1).padStart(2, '0')}-` +
      '01'
    setFecha(nuevaFecha)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/cursos/${cursoId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Curso
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Tomar Asistencia</h1>
          <p className="text-gray-600 mt-1">{curso.nombre}</p>
        </div>
      </div>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              <span>Configuración de Asistencia</span>
            </div>
            <span className="text-sm text-gray-500">
              {currentDate.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </CardTitle>
          <CardDescription>
            Selecciona la fecha desde el calendario o el selector y marca la asistencia de cada alumno
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selector de fecha y acciones rápidas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-xs">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAllAsistencias('presente')}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Todos Presentes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAllAsistencias('ausente')}
                >
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  Todos Ausentes
                </Button>
              </div>
            </div>

            {/* Calendario de asistencias */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Calendario de asistencias
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => cambiarMes(-1)}
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentDate.toLocaleDateString('es-AR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => cambiarMes(1)}
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
                  <span>L</span>
                  <span>M</span>
                  <span>M</span>
                  <span>J</span>
                  <span>V</span>
                  <span>S</span>
                  <span>D</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {celdasCalendario.map((dia, index) => {
                    if (!dia) {
                      return <div key={index} />
                    }

                    const dateKey =
                      `${year}-` +
                      `${String(month + 1).padStart(2, '0')}-` +
                      `${String(dia).padStart(2, '0')}`
                    const tieneAsistencia = fechasRegistradas.has(dateKey)
                    const esSeleccionado = fecha === dateKey

                    let classes =
                      'w-8 h-8 flex items-center justify-center rounded-full cursor-pointer'

                    if (esSeleccionado) {
                      classes += ' bg-blue-600 text-white font-semibold'
                    } else if (tieneAsistencia) {
                      classes +=
                        ' bg-green-100 text-green-700 font-semibold hover:bg-green-200'
                    } else {
                      classes +=
                        ' text-gray-700 hover:bg-gray-100'
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        className={classes}
                        onClick={() => setFecha(dateKey)}
                      >
                        {dia}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-[11px] text-gray-500 text-left">
                  Los días <span className="font-semibold text-green-700">resaltados en verde</span> tienen asistencias registradas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de asistencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Lista de Alumnos ({asistenciaData?.length || 0})
            </div>
            <Button 
              onClick={handleGuardar}
              disabled={createAsistenciasBulk.isPending || asistenciaLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {createAsistenciasBulk.isPending ? 'Guardando...' : 'Guardar Asistencias'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {asistenciaLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando alumnos...</p>
            </div>
          ) : asistenciaData && asistenciaData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asistenciaData.map(({ alumno, asistencia: asistenciaExistente }) => (
                  <TableRow key={alumno.id}>
                    <TableCell className="font-medium">
                      {alumno.nombre} {alumno.apellido}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {alumno.dni}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(asistencias[alumno.id] || 'presente')}
                        <span className="capitalize text-sm">
                          {asistencias[alumno.id] || 'presente'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={asistencias[alumno.id] || 'presente'}
                        onValueChange={(value: 'presente' | 'ausente' | 'tarde') => 
                          handleAsistenciaChange(alumno.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presente">Presente</SelectItem>
                          <SelectItem value="ausente">Ausente</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay alumnos inscriptos
              </h3>
              <p className="text-gray-600">
                Agrega alumnos a este curso para poder tomar asistencia.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
