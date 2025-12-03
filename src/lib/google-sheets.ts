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
 * Funciona sin API Key si la hoja es pública
 */
export async function readSheetData(sheetName: string, range?: string): Promise<any[]> {
  if (!GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID) {
    throw new Error('Google Sheet ID no configurado. Agrega NEXT_PUBLIC_GOOGLE_SHEET_ID en .env.local')
  }

  const sheetId = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID
  const apiKey = GOOGLE_SHEETS_CONFIG.API_KEY

  // Método 1: Si tienes API Key, usa la API oficial
  if (apiKey && apiKey !== 'your_google_api_key') {
    const rangeParam = range || `${sheetName}!A:Z`
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${rangeParam}?key=${apiKey}`

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
      const result = rows.map((row: any[]) => {
        const obj: any = {}
        headers.forEach((header: string, index: number) => {
          // Normalizar nombres de columnas (minúsculas, sin espacios)
          const normalizedHeader = header.toLowerCase().trim()
          obj[normalizedHeader] = row[index] || ''
          // También mantener el nombre original por compatibilidad
          obj[header] = row[index] || ''
        })
        return obj
      })
      
      // Logging para debug (solo en desarrollo)
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`📄 Datos leídos de ${sheetName}:`, {
          headers,
          totalRows: result.length,
          firstRow: result[0]
        })
      }
      
      return result
    } catch (error) {
      console.error('Error al leer Google Sheets con API:', error)
      throw error
    }
  }

  // Método 2: Sin API Key - usar formato CSV público (solo funciona si la hoja es pública)
  try {
    // Obtener el GID de la hoja (necesitamos el índice de la pestaña)
    // Por ahora, intentamos con el nombre de la hoja directamente
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
    
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Error al leer Google Sheets: ${response.statusText}. Asegúrate de que la hoja sea pública.`)
    }

    const csvText = await response.text()
    
    if (!csvText || csvText.trim().length === 0) {
      return []
    }

    // Parsear CSV
    const lines = csvText.split('\n').filter(line => line.trim().length > 0)
    if (lines.length === 0) {
      return []
    }

    // Primera línea son los encabezados
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1)

    // Convertir filas a objetos
    return rows.map((row: string) => {
      // Parsear CSV manualmente (maneja comillas y comas dentro de valores)
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Último valor

      const obj: any = {}
      headers.forEach((header: string, index: number) => {
        // Normalizar nombres de columnas (minúsculas, sin espacios)
        const normalizedHeader = header.toLowerCase().trim()
        obj[normalizedHeader] = values[index] || ''
        // También mantener el nombre original por compatibilidad
        obj[header] = values[index] || ''
      })
      return obj
    })
  } catch (error) {
    console.error('Error al leer Google Sheets:', error)
    throw new Error(
      'Error al leer Google Sheets. ' +
      'Asegúrate de que: 1) La hoja sea pública (Compartir → Cualquier persona con el enlace), ' +
      '2) El nombre de la hoja sea correcto, 3) El Sheet ID sea correcto.'
    )
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

