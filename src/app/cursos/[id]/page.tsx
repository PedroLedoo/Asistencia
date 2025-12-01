'use client'

import { useParams } from 'next/navigation'
import { useCurso } from '@/hooks/useCursos'
import { useCreateAlumno, useDeleteAlumno } from '@/hooks/useAlumnos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BookOpen, Users, Plus, Calendar, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { exportToCSV } from '@/lib/utils'

export default function CursoDetailPage() {
  const params = useParams()
  const cursoId = params.id as string
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAlumno, setNewAlumno] = useState({
    nombre: '',
    apellido: '',
    dni: ''
  })
  
  const { data: curso, isLoading } = useCurso(cursoId)
  const createAlumno = useCreateAlumno()
  const deleteAlumno = useDeleteAlumno()

  const handleAddAlumno = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createAlumno.mutateAsync({
        ...newAlumno,
        curso_id: cursoId
      })
      
      setNewAlumno({ nombre: '', apellido: '', dni: '' })
      setShowAddForm(false)
    } catch (error) {
      alert('Error al agregar alumno')
    }
  }

  const handleDeleteAlumno = async (alumnoId: string, nombreCompleto: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombreCompleto}?`)) {
      try {
        await deleteAlumno.mutateAsync(alumnoId)
      } catch (error) {
        alert('Error al eliminar alumno')
      }
    }
  }

  const handleExportCSV = () => {
    if (!curso?.alumnos) return
    
    const data = curso.alumnos.map(alumno => ({
      'Nombre': alumno.nombre,
      'Apellido': alumno.apellido,
      'DNI': alumno.dni,
      'Fecha de Inscripción': new Date(alumno.creado_en).toLocaleDateString('es-AR')
    }))
    
    exportToCSV(data, `alumnos_${curso.nombre}_${new Date().toISOString().split('T')[0]}.csv`)
  }

  if (isLoading) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/cursos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Cursos
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{curso.nombre}</h1>
          <p className="text-gray-600 mt-1">
            Creado el {new Date(curso.creado_en).toLocaleDateString('es-AR')}
          </p>
        </div>
        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
          <Link href={`/cursos/${cursoId}/asistencia`}>
            <Calendar className="mr-2 h-5 w-5" />
            Tomar Asistencia
          </Link>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{curso.alumnos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Alumnos inscriptos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesor</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{curso.profesores?.nombre}</div>
            <p className="text-xs text-muted-foreground">
              {curso.profesores?.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {new Date(curso.creado_en).toLocaleDateString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Fecha de creación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de alumnos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Alumnos Inscriptos ({curso.alumnos?.length || 0})
              </CardTitle>
              <CardDescription>
                Gestiona los alumnos de este curso
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={!curso.alumnos?.length}
              >
                Exportar CSV
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Alumno
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario para agregar alumno */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agregar Nuevo Alumno</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAlumno} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={newAlumno.nombre}
                        onChange={(e) => setNewAlumno(prev => ({ ...prev, nombre: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={newAlumno.apellido}
                        onChange={(e) => setNewAlumno(prev => ({ ...prev, apellido: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dni">DNI</Label>
                      <Input
                        id="dni"
                        value={newAlumno.dni}
                        onChange={(e) => setNewAlumno(prev => ({ ...prev, dni: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={createAlumno.isPending}
                    >
                      {createAlumno.isPending ? 'Agregando...' : 'Agregar Alumno'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tabla de alumnos */}
          {curso.alumnos && curso.alumnos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Fecha de Inscripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {curso.alumnos.map((alumno) => (
                  <TableRow key={alumno.id}>
                    <TableCell className="font-medium">{alumno.nombre}</TableCell>
                    <TableCell>{alumno.apellido}</TableCell>
                    <TableCell className="font-mono">{alumno.dni}</TableCell>
                    <TableCell>
                      {new Date(alumno.creado_en).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlumno(
                          alumno.id, 
                          `${alumno.nombre} ${alumno.apellido}`
                        )}
                        disabled={deleteAlumno.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
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
              <p className="text-gray-600 mb-4">
                Agrega el primer alumno a este curso para comenzar.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Alumno
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
