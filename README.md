# Sistema de Asistencias CPFP N°6

Sistema web completo para la gestión de asistencias estudiantiles desarrollado con Next.js 15. Soporta múltiples fuentes de datos: Supabase, Google Sheets o modo local.

## 🚀 Características

- **Autenticación segura** con Supabase Auth
- **Dashboard intuitivo** para profesores
- **Gestión de cursos** y alumnos
- **Toma de asistencia rápida** con interfaz tipo tabla
- **Historial completo** de asistencias
- **Exportación CSV** de reportes
- **Diseño responsive** con TailwindCSS y Shadcn/UI
- **Tiempo real** con React Query

## 🛠️ Tecnologías

- **Frontend + Backend**: Next.js 15 (App Router)
- **Base de datos**: Supabase, Google Sheets o modo local
- **UI**: TailwindCSS + Shadcn/UI
- **Estado**: React Server Components + React Query
- **Deploy**: Render, Vercel o cualquier plataforma compatible con Next.js

## 📁 Estructura del Proyecto

```
sistema-asistencias-cpfp6/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── cursos/
│   │   │   ├── [id]/
│   │   │   │   └── asistencia/
│   │   │   └── nuevo/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/          # Componentes Shadcn
│   │   ├── auth-guard.tsx
│   │   ├── navbar.tsx
│   │   └── providers.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCursos.ts
│   │   ├── useAlumnos.ts
│   │   └── useAsistencia.ts
│   └── lib/
│       ├── supabase.ts
│       └── utils.ts
├── supabase/
│   ├── schema.sql       # Esquema de la BD
│   └── seed.sql         # Datos de ejemplo
├── package.json
├── tailwind.config.ts
└── next.config.js
```

## 🗄️ Modelo de Base de Datos

### Tablas principales:

- **profesores**: Usuarios del sistema (sincronizado con Supabase Auth)
- **cursos**: Cursos asignados a profesores
- **alumnos**: Estudiantes inscriptos en cursos
- **asistencias**: Registros de asistencia diaria

### Relaciones:
- Un profesor puede tener múltiples cursos
- Un curso puede tener múltiples alumnos
- Un alumno puede tener múltiples asistencias
- Cada asistencia está vinculada a un alumno, curso, fecha y profesor

## 🚀 Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
git clone <url-del-repositorio>
cd sistema-asistencias-cpfp6
npm install
```

### 2. Configurar Base de Datos (Elige una opción)

#### Opción A: Google Sheets (Recomendado para empezar - Sin API Key)

1. Crea una hoja en [Google Sheets](https://sheets.google.com)
2. Crea las pestañas: `Profesores`, `Cursos`, `Alumnos`, `Asistencias`
3. Haz la hoja pública (Compartir → Cualquier persona con el enlace)
4. Copia el Sheet ID de la URL
5. Crea archivo `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id
```

**Ver guía completa:** [GOOGLE_SHEETS_SIN_API.md](./GOOGLE_SHEETS_SIN_API.md)

#### Opción B: Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar las credenciales del proyecto
3. Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. En el panel de Supabase, ir a **SQL Editor**
5. Ejecutar el contenido de `supabase/schema.sql`
6. En **Authentication > Settings**, configurar:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/dashboard`

#### Opción C: Modo Local (Sin base de datos externa)

No necesitas configurar nada. El sistema usará localStorage para guardar datos localmente.

### 3. Ejecutar el Proyecto

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 👥 Usuarios de Prueba

Si ejecutaste el seed, puedes crear usuarios desde la interfaz o usar Supabase Auth directamente.

**Para crear el primer usuario:**
1. Ir a `/login`
2. Registrarse con email y contraseña
3. El sistema creará automáticamente el perfil de profesor

## 🎯 Funcionalidades Principales

### Dashboard
- Resumen de cursos y alumnos
- Accesos rápidos a funciones principales
- Estadísticas básicas

### Gestión de Cursos
- Crear, ver y gestionar cursos
- Agregar/eliminar alumnos
- Ver detalles y estadísticas

### Toma de Asistencia
- Interfaz rápida tipo tabla
- Selección masiva (todos presentes/ausentes)
- Estados: Presente, Ausente, Tarde
- Guardado automático por fecha

### Reportes
- Exportación CSV de listas de alumnos
- Historial de asistencias
- Filtros por fecha y curso

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas de acceso** por profesor (solo ven sus datos)
- **Autenticación JWT** con Supabase
- **Validación de datos** en cliente y servidor

## 🚀 Deploy en Render

### 1. Preparar el Repositorio

1. Sube tu código a GitHub:
```bash
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### 2. Crear Servicio en Render

1. Ve a [Render](https://render.com) e inicia sesión
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name:** `sistema-asistencias-cpfp6`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### 3. Configurar Variables de Entorno

En Render → Environment → Add Environment Variable:

**Si usas Google Sheets:**
```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera_un_string_largo
NODE_ENV=production
```

**Si usas Supabase:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera_un_string_largo
NODE_ENV=production
```

### 4. Desplegar

1. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
2. Espera a que termine el build
3. Tu app estará disponible en `https://tu-app.onrender.com`

**Ver guía completa:** [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

## 🚀 Deploy en Vercel (Alternativa)

1. Ir a [Vercel](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar variables de entorno (igual que Render)
4. Vercel desplegará automáticamente en cada push

## 📱 Uso de la Aplicación

### Para Profesores:

1. **Login**: Iniciar sesión con email/contraseña
2. **Dashboard**: Ver resumen de cursos y alumnos
3. **Crear Curso**: Agregar nuevos cursos
4. **Gestionar Alumnos**: Agregar estudiantes a los cursos
5. **Tomar Asistencia**: 
   - Seleccionar curso
   - Elegir fecha
   - Marcar presente/ausente/tarde para cada alumno
   - Guardar asistencias
6. **Reportes**: Exportar datos en CSV

### Flujo Típico:
1. Crear curso → 2. Agregar alumnos → 3. Tomar asistencia diaria → 4. Consultar reportes

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Ejecutar build
npm run lint         # Linter
npm run type-check   # Verificar tipos TypeScript
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico:
- Email: soporte@cpfp6.edu.ar
- GitHub Issues: [Crear issue](https://github.com/tu-usuario/sistema-asistencias-cpfp6/issues)

---

**Desarrollado con ❤️ para la educación - CPFP N°6**