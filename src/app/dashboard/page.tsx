'use client'

import { useCursos } from '@/hooks/useCursos'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Calendar, Plus, ArrowRight, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: cursos, isLoading } = useCursos()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {user?.user_metadata?.nombre || 'Profesor'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona las asistencias de tus cursos de manera rápida y eficiente.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cursos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cursos asignados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cursos?.reduce((total: number, curso: { alumnos?: { id: string }[] | null }) => total + (curso.alumnos?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En todos los cursos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fecha Actual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long'
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tomar Asistencia</CardTitle>
            <CardDescription>
              Registra la asistencia de tus alumnos de forma rápida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/cursos">
                <Calendar className="mr-2 h-4 w-4" />
                Seleccionar Curso
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestionar Cursos</CardTitle>
            <CardDescription>
              Administra tus cursos y alumnos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/cursos">
                <BookOpen className="mr-2 h-4 w-4" />
                Ver Todos los Cursos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes y Exportaciones</CardTitle>
            <CardDescription>
              Exporta tus datos a CSV para Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/reportes">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Ver Reportes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de cursos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Mis Cursos</h2>
          <Button asChild>
            <Link href="/cursos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Curso
            </Link>
          </Button>
        </div>

        {cursos && cursos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map((curso: { id: string; nombre: string; alumnos?: { id: string }[] | null; profesores?: { id: string; nombre: string; email: string } | null; creado_en: string }) => (
              <Card key={curso.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                  <CardDescription>
                    {curso.alumnos?.length || 0} alumnos inscriptos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/cursos/${curso.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/cursos/${curso.id}/asistencia`}>
                        Asistencia
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes cursos asignados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer curso para gestionar las asistencias.
              </p>
              <Button asChild>
                <Link href="/cursos/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Curso
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
