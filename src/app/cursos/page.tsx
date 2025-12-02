'use client'

import { useCursos, useDeleteCurso } from '@/hooks/useCursos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Plus, Calendar, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CursosPage() {
  const { data: cursos, isLoading } = useCursos()
  const deleteCurso = useDeleteCurso()
  const [cursoEliminando, setCursoEliminando] = useState<string | null>(null)

  const handleDeleteCurso = async (cursoId: string, nombreCurso: string) => {
    if (confirm(`¿Estás seguro de eliminar el curso "${nombreCurso}"?\n\nEsta acción eliminará también todos los alumnos y asistencias asociadas.`)) {
      setCursoEliminando(cursoId)
      try {
        await deleteCurso.mutateAsync(cursoId)
        alert('Curso eliminado exitosamente')
      } catch (error) {
        alert('Error al eliminar el curso')
      } finally {
        setCursoEliminando(null)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus cursos y toma asistencia de manera eficiente.
          </p>
        </div>
        <Button asChild>
          <Link href="/cursos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Curso
          </Link>
        </Button>
      </div>

      {/* Lista de cursos */}
      {cursos && cursos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">{curso.nombre}</span>
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </CardTitle>
                <CardDescription>
                  Creado el {new Date(curso.creado_en).toLocaleDateString('es-AR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{curso.alumnos?.length || 0} alumnos inscriptos</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/cursos/${curso.id}`}>
                      Ver Detalles y Alumnos
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link href={`/cursos/${curso.id}/asistencia`}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Tomar Asistencia
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCurso(curso.id, curso.nombre)}
                    disabled={cursoEliminando === curso.id || deleteCurso.isPending}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {cursoEliminando === curso.id ? 'Eliminando...' : 'Eliminar Curso'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tienes cursos creados
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comienza creando tu primer curso para poder gestionar las asistencias de tus alumnos.
            </p>
            <Button asChild size="lg">
              <Link href="/cursos/nuevo">
                <Plus className="mr-2 h-5 w-5" />
                Crear Mi Primer Curso
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
