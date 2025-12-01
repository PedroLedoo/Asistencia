/**
 * Sistema de detección de fuente de datos
 * Permite usar Google Sheets o Supabase según la configuración
 */

export type DataSource = 'supabase' | 'google-sheets' | 'local'

/**
 * Detecta qué fuente de datos usar basándose en las variables de entorno
 */
export function detectDataSource(): DataSource {
  const googleSheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Verificar si Google Sheets está configurado
  if (googleSheetId && googleSheetId !== 'your_google_sheet_id') {
    return 'google-sheets'
  }

  // Verificar si Supabase está configurado
  if (supabaseUrl && supabaseAnonKey) {
    const isValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)
    const isValidAnonKey = supabaseAnonKey.length > 50 && supabaseAnonKey.startsWith('eyJ')
    
    if (isValidSupabaseUrl && isValidAnonKey) {
      return 'supabase'
    }
  }

  // Por defecto, usar modo local
  return 'local'
}

/**
 * Obtiene la fuente de datos actual
 */
export const CURRENT_DATA_SOURCE = detectDataSource()

/**
 * Mensaje informativo sobre la fuente de datos activa
 */
export function getDataSourceInfo(): string {
  switch (CURRENT_DATA_SOURCE) {
    case 'google-sheets':
      return 'Usando Google Sheets como base de datos'
    case 'supabase':
      return 'Usando Supabase como base de datos'
    case 'local':
      return 'Modo local (sin base de datos externa)'
  }
}

