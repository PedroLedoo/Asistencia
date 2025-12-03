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
  
  // Verificar configuración de Google Sheets
  const googleSheetId = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID
  const appsScriptUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || '') 
    : ''
  
  const isGoogleSheetIdConfigured = !!googleSheetId && googleSheetId !== 'your_google_sheet_id' && googleSheetId !== ''
  const isAppsScriptConfigured = !!appsScriptUrl && appsScriptUrl !== 'your_apps_script_url' && appsScriptUrl !== ''

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

      {/* Estado de Configuración de Google Sheets */}
      {isGoogleSheets && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>🔍 Diagnóstico de Configuración</CardTitle>
            <CardDescription>
              Verifica que todo esté configurado correctamente para crear/eliminar desde la página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-md ${isGoogleSheetIdConfigured ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div>
                  <p className="font-medium">Google Sheet ID</p>
                  <p className="text-sm">
                    {isGoogleSheetIdConfigured ? '✅ Configurado - Puedes leer datos' : '❌ No configurado'}
                  </p>
                </div>
                {isGoogleSheetIdConfigured && googleSheetId && (
                  <div className="text-xs text-gray-500 font-mono">
                    {googleSheetId.substring(0, 20)}...
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between p-3 rounded-md ${isAppsScriptConfigured ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex-1">
                  <p className="font-medium">Google Apps Script URL</p>
                  <p className="text-sm">
                    {isAppsScriptConfigured ? '✅ Configurado - Puedes crear/eliminar' : '❌ No configurado'}
                  </p>
                  {!isAppsScriptConfigured && (
                    <p className="text-xs text-yellow-700 mt-1 font-medium">
                      ⚠️ Sin esto NO puedes crear/eliminar cursos o alumnos desde la página
                    </p>
                  )}
                </div>
                {isAppsScriptConfigured && (
                  <div className="text-xs text-gray-500 font-mono ml-2">
                    {appsScriptUrl.substring(0, 30)}...
                  </div>
                )}
              </div>

              {!isAppsScriptConfigured && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-md">
                  <p className="font-bold text-yellow-800 mb-3">⚠️ Configuración Requerida</p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Para poder <strong>crear y eliminar</strong> cursos/alumnos desde la página, necesitas configurar Google Apps Script:
                  </p>
                  <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-2 mb-3">
                    <li>Ve a tu Google Sheet → <strong>Extensiones → Apps Script</strong></li>
                    <li>Copia el código de <code className="bg-yellow-100 px-1 rounded">GOOGLE_APPS_SCRIPT.js</code></li>
                    <li>Reemplaza <code className="bg-yellow-100 px-1 rounded">TU_SHEET_ID_AQUI</code> con tu ID real</li>
                    <li><strong>Despliega</strong> como "Aplicación web" con acceso "Cualquiera"</li>
                    <li>Copia la URL y agrégala en <strong>Render → Environment → NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL</strong></li>
                  </ol>
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link href="/CONFIGURACION_COMPLETA_GOOGLE_SHEETS.md" target="_blank">
                      Ver Guía Completa Paso a Paso
                    </Link>
                  </Button>
                </div>
              )}

              {isAppsScriptConfigured && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-medium text-green-800 mb-2">✅ Todo Configurado Correctamente</p>
                  <p className="text-sm text-green-700">
                    Puedes crear y eliminar cursos/alumnos desde la página. Los datos se guardarán automáticamente en Google Sheets.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variables de entorno necesarias */}
      <Card>
        <CardHeader>
          <CardTitle>Variables de Entorno</CardTitle>
          <CardDescription>
            Configura estas variables en <strong>Render → Environment</strong> o en <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Para Google Sheets:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=tu_apps_script_url`}
              </pre>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p><strong>NEXT_PUBLIC_GOOGLE_SHEET_ID:</strong> Obligatorio para leer datos ✅</p>
                <p><strong>NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL:</strong> Obligatorio para crear/eliminar datos ⚠️</p>
              </div>
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

