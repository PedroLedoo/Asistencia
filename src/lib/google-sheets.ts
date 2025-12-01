/**
 * Integración con Google Sheets API
 * Permite usar Google Sheets como base de datos
 */

// Configuración de Google Sheets
export const GOOGLE_SHEETS_CONFIG = {
  // ID de tu hoja de cálculo (lo obtienes de la URL de Google Sheets)
  SPREADSHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
  // API Key de Google (opcional, para acceso público)
  API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
}

// Estructura de las hojas en Google Sheets
export const SHEETS = {
  PROFESORES: 'Profesores',
  CURSOS: 'Cursos',
  ALUMNOS: 'Alumnos',
  ASISTENCIAS: 'Asistencias',
}

/**
 * Lee datos de una hoja de Google Sheets
 */
export async function readSheetData(sheetName: string, range?: string): Promise<any[]> {
  if (!GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID) {
    throw new Error('Google Sheet ID no configurado. Agrega NEXT_PUBLIC_GOOGLE_SHEET_ID en .env.local')
  }

  const rangeParam = range || `${sheetName}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${rangeParam}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error al leer Google Sheets: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.values || data.values.length === 0) {
      return []
    }

    // Primera fila son los encabezados
    const headers = data.values[0]
    const rows = data.values.slice(1)

    // Convertir filas a objetos
    return rows.map((row: any[]) => {
      const obj: any = {}
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || ''
      })
      return obj
    })
  } catch (error) {
    console.error('Error al leer Google Sheets:', error)
    throw error
  }
}

/**
 * Escribe datos en una hoja de Google Sheets
 * Nota: Esto requiere autenticación OAuth2 para hojas privadas
 * Para hojas públicas, puedes usar Apps Script
 */
export async function writeSheetData(
  sheetName: string,
  data: any[],
  append: boolean = true
): Promise<void> {
  if (!GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID) {
    throw new Error('Google Sheet ID no configurado')
  }

  // Para escribir datos, necesitas usar Google Apps Script o OAuth2
  // Por ahora, retornamos un error informativo
  throw new Error(
    'Para escribir en Google Sheets, configura Google Apps Script. ' +
    'Ver instrucciones en el README.'
  )
}

/**
 * Convierte datos de la app al formato de Google Sheets
 */
export function formatDataForSheets(data: any[], headers: string[]): string[][] {
  return [
    headers,
    ...data.map(row => headers.map(header => String(row[header] || '')))
  ]
}

/**
 * Convierte datos de Google Sheets al formato de la app
 */
export function parseSheetData(rows: any[], headers: string[]): any[] {
  return rows.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ''
    })
    return obj
  })
}

