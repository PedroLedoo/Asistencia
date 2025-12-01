'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, FileSpreadsheet, Cloud, Info } from 'lucide-react'
import Link from 'next/link'
import { CURRENT_DATA_SOURCE, getDataSourceInfo } from '@/lib/data-source'
import { GOOGLE_SHEETS_CONFIG } from '@/lib/google-sheets'

export default function ConfiguracionPage() {
  const dataSourceInfo = getDataSourceInfo()
  const isGoogleSheets = CURRENT_DATA_SOURCE === 'google-sheets'
  const isSupabase = CURRENT_DATA_SOURCE === 'supabase'
  const isLocal = CURRENT_DATA_SOURCE === 'local'

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
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Base de Datos</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Gestiona la fuente de datos de tu sistema de asistencias
        </p>
      </div>

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Estado Actual
          </CardTitle>
          <CardDescription>
            Fuente de datos actualmente activa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {isGoogleSheets && <FileSpreadsheet className="h-6 w-6 text-green-600" />}
              {isSupabase && <Cloud className="h-6 w-6 text-blue-600" />}
              {isLocal && <Database className="h-6 w-6 text-gray-600" />}
              <div>
                <p className="font-medium text-lg">{dataSourceInfo}</p>
                {isGoogleSheets && GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID && (
                  <p className="text-sm text-gray-600 mt-1">
                    Sheet ID: {GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID.substring(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Google Sheets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Google Sheets
          </CardTitle>
          <CardDescription>
            Usa Google Sheets como tu base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Ventajas:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Fácil de usar y familiar</li>
              <li>Puedes ver y editar datos directamente en Google Sheets</li>
              <li>Gratis para uso personal</li>
              <li>Fácil de compartir con otros usuarios</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Configuración:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Crea una hoja de cálculo en Google Sheets</li>
              <li>Crea las hojas: Profesores, Cursos, Alumnos, Asistencias</li>
              <li>Obtén el ID de la hoja de la URL</li>
              <li>Configura las variables en <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <a 
                href="/GOOGLE_SHEETS_SETUP.md" 
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Guía Completa de Configuración
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Supabase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="mr-2 h-5 w-5" />
            Supabase
          </CardTitle>
          <CardDescription>
            Usa Supabase como tu base de datos (recomendado para producción)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Ventajas:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Base de datos SQL completa</li>
              <li>Mejor rendimiento para grandes volúmenes de datos</li>
              <li>Autenticación integrada</li>
              <li>API REST automática</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Configuración:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Crea una cuenta en Supabase</li>
              <li>Crea un nuevo proyecto</li>
              <li>Ejecuta el script SQL para crear las tablas</li>
              <li>Configura las variables en <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Variables de entorno necesarias */}
      <Card>
        <CardHeader>
          <CardTitle>Variables de Entorno</CardTitle>
          <CardDescription>
            Configura estas variables en tu archivo <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Para Google Sheets:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=tu_apps_script_url`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Para Supabase:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

