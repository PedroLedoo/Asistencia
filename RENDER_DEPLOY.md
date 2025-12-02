# Guía de Despliegue en Render

Esta guía te explica cómo desplegar tu aplicación de asistencias en Render y configurar todas las variables de entorno.

## 📋 Paso 1: Preparar el Repositorio

1. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Render"
   git push origin main
   ```

2. **Asegúrate de tener un `package.json` con el script `build`:**
   - Ya deberías tenerlo, pero verifica que incluya:
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     }
   }
   ```

## 🚀 Paso 2: Crear el Servicio en Render

1. **Ve a [Render](https://render.com)** e inicia sesión (puedes usar tu cuenta de GitHub)

2. **Crea un nuevo servicio:**
   - Haz clic en **"New +"** → **"Web Service"**

3. **Conecta tu repositorio:**
   - Selecciona tu repositorio de GitHub
   - O conecta manualmente si no aparece

4. **Configura el servicio:**
   - **Name:** `sistema-asistencias-cpfp6` (o el nombre que prefieras)
   - **Region:** Elige la región más cercana a tus usuarios
   - **Branch:** `main` (o la rama que uses)
   - **Root Directory:** (déjalo vacío si el proyecto está en la raíz)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

## 🔐 Paso 3: Configurar Variables de Entorno

En la sección **"Environment"** de tu servicio en Render, agrega las siguientes variables:

### Variables Obligatorias (elige una opción)

#### Opción A: Usando Google Sheets

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id_aqui
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=tu_apps_script_url_aqui
```

#### Opción B: Usando Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### Variables Opcionales (pero recomendadas)

```env
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=un_string_largo_y_aleatorio_aqui
NODE_ENV=production
```

## 📝 Paso 4: Agregar Variables en Render

1. **En el dashboard de Render, ve a tu servicio**

2. **Haz clic en "Environment" en el menú lateral**

3. **Agrega cada variable:**
   - Haz clic en **"Add Environment Variable"**
   - **Key:** El nombre de la variable (ej: `NEXT_PUBLIC_GOOGLE_SHEET_ID`)
   - **Value:** El valor de la variable
   - Haz clic en **"Save Changes"**

4. **Repite para todas las variables necesarias**

## 🔄 Paso 5: Configurar el Build

1. **En la configuración del servicio, verifica:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

2. **Si usas pnpm o yarn, ajusta los comandos:**
   - **pnpm:** `pnpm install && pnpm run build` / `pnpm start`
   - **yarn:** `yarn install && yarn build` / `yarn start`

## 🌐 Paso 6: Configurar el Dominio

1. **Render te asignará automáticamente una URL:**
   - Algo como: `https://sistema-asistencias-cpfp6.onrender.com`

2. **Actualiza las variables de entorno con esta URL:**
   - Si usas `NEXTAUTH_URL`, actualízala con tu URL de Render
   - Si usas Google Sheets, actualiza las URLs de redirección si es necesario

## 🔧 Paso 7: Configurar Supabase para Producción (si usas Supabase)

1. **Ve a tu proyecto en Supabase**

2. **Authentication → URL Configuration:**
   - **Site URL:** `https://tu-app.onrender.com`
   - **Redirect URLs:** Agrega `https://tu-app.onrender.com/dashboard`

## 📊 Paso 8: Configurar Google Sheets para Producción (si usas Google Sheets)

1. **Asegúrate de que tu hoja de Google Sheets sea pública** (o tenga los permisos correctos)

2. **Si usas Google Apps Script:**
   - Verifica que la URL de Apps Script esté configurada en las variables de entorno
   - Asegúrate de que el script tenga permisos para ejecutarse

## ✅ Paso 9: Desplegar

1. **Haz clic en "Manual Deploy" → "Deploy latest commit"**

2. **Espera a que termine el build** (puede tardar 5-10 minutos la primera vez)

3. **Verifica los logs:**
   - Si hay errores, revisa la pestaña "Logs"
   - Los errores más comunes son variables de entorno faltantes

## 🐛 Solución de Problemas Comunes

### Error: "Environment variable not found"
- **Solución:** Verifica que todas las variables estén agregadas en Render
- Asegúrate de que las variables que empiezan con `NEXT_PUBLIC_` estén configuradas

### Error: "Build failed"
- **Solución:** 
  - Revisa los logs del build
  - Verifica que `package.json` tenga los scripts correctos
  - Asegúrate de que todas las dependencias estén en `package.json`

### Error: "Application crashed"
- **Solución:**
  - Revisa los logs en tiempo real
  - Verifica que todas las variables de entorno estén correctas
  - Asegúrate de que la base de datos (Supabase o Google Sheets) esté accesible

### La aplicación carga pero no hay datos
- **Solución:**
  - Verifica que las variables de entorno estén correctamente configuradas
  - Revisa que la base de datos tenga datos
  - Verifica los permisos de acceso a Google Sheets o Supabase

## 📋 Checklist de Despliegue

Antes de desplegar, verifica:

- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas en Render
- [ ] `NEXTAUTH_URL` apunta a tu URL de Render
- [ ] Base de datos (Supabase/Google Sheets) configurada para producción
- [ ] Build command y start command correctos
- [ ] Todas las dependencias en `package.json`

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

1. **Haz commit y push a GitHub:**
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```

2. **Render desplegará automáticamente** (si tienes auto-deploy activado)

3. **O despliega manualmente** desde el dashboard de Render

## 💡 Tips Adicionales

- **Auto-deploy:** Render puede desplegar automáticamente en cada push a `main`
- **Preview Deployments:** Puedes crear deployments de preview para ramas específicas
- **Logs:** Siempre revisa los logs si algo no funciona
- **Variables Secretas:** Render encripta automáticamente las variables de entorno

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica que todas las variables estén configuradas
3. Consulta la [documentación de Render](https://render.com/docs)


