# Guía de Despliegue

Esta guía te ayuda a desplegar el Sistema de Asistencias CPFP N°6 en Render.

## 📋 Pre-requisitos

- [ ] Código subido a GitHub
- [ ] Cuenta en [Render](https://render.com)
- [ ] Base de datos configurada (Google Sheets o Supabase)

## 🚀 Despliegue Rápido en Render

### Opción 1: Usando render.yaml (Recomendado)

1. **El archivo `render.yaml` ya está configurado** en la raíz del proyecto
2. En Render, ve a **Dashboard** → **New +** → **Blueprint**
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente el `render.yaml`
5. Configura las variables de entorno manualmente
6. Haz clic en **Apply**

### Opción 2: Configuración Manual

1. Ve a [Render](https://render.com)
2. **New +** → **Web Service**
3. Conecta tu repositorio
4. Configura:
   - **Name:** `sistema-asistencias-cpfp6`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Agrega variables de entorno (ver abajo)
6. **Create Web Service**

## 🔐 Variables de Entorno en Render

### Para Google Sheets (Recomendado)

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera_un_string_largo
NODE_ENV=production
```

### Para Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera_un_string_largo
NODE_ENV=production
```

**Importante:** 
- `NEXTAUTH_URL` debe ser la URL que Render te asigne
- `NEXTAUTH_SECRET` debe ser un string largo y aleatorio

## 📝 Pasos Detallados

### 1. Subir Código a GitHub

```bash
git add .
git commit -m "Preparar para despliegue en Render"
git push origin main
```

### 2. Crear Servicio en Render

1. Inicia sesión en [Render](https://render.com)
2. Haz clic en **"New +"** → **"Web Service"**
3. Selecciona tu repositorio de GitHub
4. Completa la configuración básica

### 3. Configurar Build y Start

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 4. Agregar Variables de Entorno

1. Ve a **Environment** en tu servicio
2. Agrega cada variable una por una
3. **Importante:** Después de agregar variables, haz un nuevo deploy

### 5. Primer Deploy

1. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
2. Espera a que termine (5-10 minutos la primera vez)
3. Revisa los logs si hay errores

### 6. Actualizar NEXTAUTH_URL

1. Después del primer deploy, Render te dará una URL
2. Ve a **Environment** en Render
3. Actualiza `NEXTAUTH_URL` con tu URL real
4. Haz otro deploy

## ✅ Verificación Post-Deploy

- [ ] La aplicación carga sin errores
- [ ] Puedes iniciar sesión
- [ ] Los datos se cargan correctamente
- [ ] No hay errores en la consola del navegador

## 🔄 Actualizaciones Futuras

Render puede desplegar automáticamente en cada push a `main`:

1. Ve a **Settings** → **Auto-Deploy**
2. Activa **"Auto-Deploy"**
3. Cada push a `main` desplegará automáticamente

## 🐛 Solución de Problemas

### Build Falla

- Revisa los logs del build
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que los scripts estén correctos

### App No Carga

- Revisa los logs en tiempo real
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que `NEXTAUTH_URL` sea correcta

### Error de Base de Datos

- Verifica que las credenciales sean correctas
- Si usas Google Sheets, asegúrate de que sea pública
- Si usas Supabase, verifica los permisos

## 📚 Documentación Adicional

- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Guía completa de despliegue
- [RENDER_ENV_VARIABLES.md](./RENDER_ENV_VARIABLES.md) - Lista de variables
- [GOOGLE_SHEETS_SIN_API.md](./GOOGLE_SHEETS_SIN_API.md) - Configurar Google Sheets

