'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCreateCurso } from '@/hooks/useCursos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function NuevoCursoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createCurso = useCreateCurso()
  
  const [nombre, setNombre] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    try {
      const nuevoCurso = await createCurso.mutateAsync({
        nombre,
        profesor_id: user.id
      })
      
      console.log('✅ Curso creado:', nuevoCurso)
      
      // Esperar más tiempo para que Google Sheets se sincronice y la caché se actualice
      // Invalidar explícitamente las queries de Google Sheets
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Forzar recarga de la página para asegurar que se lea desde Google Sheets
      window.location.href = `/cursos/${nuevoCurso.id}`
    } catch (error) {
      console.error('Error al crear curso:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      // Mostrar mensaje más detallado
      let mensajeUsuario = `Error al crear el curso: ${errorMessage}`
      
      // Mensajes de ayuda según el tipo de error
      if (errorMessage.includes('Google Apps Script URL no configurada')) {
        mensajeUsuario += '\n\nSolución: Configura NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL en Render o .env.local'
      } else if (errorMessage.includes('Error al escribir curso en Google Sheets')) {
        mensajeUsuario += '\n\nVerifica:\n1. Que el Apps Script esté desplegado correctamente\n2. Que tenga permisos para editar la hoja\n3. Que el SPREADSHEET_ID en el Apps Script sea correcto'
      }
      
      alert(mensajeUsuario)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/cursos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Cursos
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Curso</h1>
        <p className="text-gray-600 mt-2">
          Agrega un nuevo curso para gestionar las asistencias de tus alumnos.
        </p>
      </div>

      {/* Formulario */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Información del Curso
          </CardTitle>
          <CardDescription>
            Completa los datos básicos del nuevo curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Curso *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Programación Web, Base de Datos, etc."
                required
              />
              <p className="text-sm text-gray-500">
                Ingresa un nombre descriptivo para el curso
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Profesor Asignado</p>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{user?.user_metadata?.nombre || user?.email}</p>
                <p className="text-sm text-gray-600">Este curso será asignado a tu usuario</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button 
                type="submit" 
                disabled={createCurso.isPending || !nombre.trim()}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {createCurso.isPending ? 'Creando Curso...' : 'Crear Curso'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">¿Qué puedes hacer después?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>Agregar alumnos al curso desde la página de detalles</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>Tomar asistencia diaria de forma rápida y sencilla</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>Consultar el historial de asistencias</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>Exportar reportes en formato CSV</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
