import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validación más estricta: detecta si las claves son reales o de prueba
const isValidSupabaseUrl = supabaseUrl && 
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl) &&
  !supabaseUrl.includes('abcd1234') // Detecta URLs de ejemplo

const isValidAnonKey = supabaseAnonKey && 
  supabaseAnonKey.length > 50 && // Las claves reales son muy largas (JWT)
  supabaseAnonKey.startsWith('eyJ') && // Las claves JWT empiezan así
  supabaseAnonKey !== '0199' && // Detecta valores de prueba obvios
  supabaseAnonKey !== 'your_supabase_anon_key'

export const IS_SUPABASE_CONFIGURED = !!(isValidSupabaseUrl && isValidAnonKey)

// Cliente para el navegador (o null si no hay Supabase configurado)
export const supabase = IS_SUPABASE_CONFIGURED
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any)

// Cliente para server-side (solo si Supabase está configurado)
export const createSupabaseClient = () => {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error('Supabase no está configurado en este entorno')
  }
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

// Tipos de la base de datos
export interface Database {
  public: {
    Tables: {
      profesores: {
        Row: {
          id: string
          nombre: string
          email: string
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          creado_en?: string
        }
      }
      cursos: {
        Row: {
          id: string
          nombre: string
          profesor_id: string
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          profesor_id: string
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          profesor_id?: string
          creado_en?: string
        }
      }
      alumnos: {
        Row: {
          id: string
          nombre: string
          apellido: string
          dni: string
          curso_id: string
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          apellido: string
          dni: string
          curso_id: string
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          apellido?: string
          dni?: string
          curso_id?: string
          creado_en?: string
        }
      }
      asistencias: {
        Row: {
          id: string
          alumno_id: string
          fecha: string
          estado: 'presente' | 'ausente' | 'tarde'
          cargado_por: string
          creado_en: string
        }
        Insert: {
          id?: string
          alumno_id: string
          fecha: string
          estado: 'presente' | 'ausente' | 'tarde'
          cargado_por: string
          creado_en?: string
        }
        Update: {
          id?: string
          alumno_id?: string
          fecha?: string
          estado?: 'presente' | 'ausente' | 'tarde'
          cargado_por?: string
          creado_en?: string
        }
      }
    }
  }
}
