# Variables de Entorno para Render

## 📋 Lista Completa de Variables

Copia y pega estas variables en Render → Environment → Add Environment Variable

---

## 🔵 OPCIÓN 1: Usando Google Sheets (SIN API Key - Recomendado)

Si quieres usar Google Sheets como base de datos **sin necesidad de API Key**, agrega estas variables:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id_aqui
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera_un_string_largo_y_aleatorio
NODE_ENV=production
```

### Cómo obtener el Sheet ID:

- **NEXT_PUBLIC_GOOGLE_SHEET_ID:** 
  - Abre tu hoja de Google Sheets
  - Copia el ID de la URL: `https://docs.google.com/spreadsheets/d/ABC123/edit`
  - El ID es `ABC123`
  - **IMPORTANTE:** La hoja debe ser pública (Compartir → Cualquier persona con el enlace)

### Variables Opcionales (solo si las necesitas):

```env
# Solo si quieres usar la API oficial de Google (opcional)
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_aqui

# Solo si quieres escribir datos desde la app (opcional)
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=tu_apps_script_url_aqui
```

**Nota:** Para empezar, solo necesitas el `NEXT_PUBLIC_GOOGLE_SHEET_ID`. Las otras variables son opcionales.

- **NEXTAUTH_URL:**
  - Después de crear el servicio en Render, copia la URL que te da
  - Ejemplo: `https://sistema-asistencias-cpfp6.onrender.com`

- **NEXTAUTH_SECRET:**
  - Genera un string aleatorio largo
  - Puedes usar: https://generate-secret.vercel.app/32

---

## 🟢 OPCIÓN 2: Usando Supabase

Si quieres usar Supabase como base de datos, agrega estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera_un_string_largo_y_aleatorio
NODE_ENV=production
```

### Cómo obtener cada valor:

- **NEXT_PUBLIC_SUPABASE_URL:**
  - Ve a tu proyecto en Supabase
  - Settings → API
  - Copia "Project URL"

- **NEXT_PUBLIC_SUPABASE_ANON_KEY:**
  - En el mismo lugar (Settings → API)
  - Copia "anon public" key

- **SUPABASE_SERVICE_ROLE_KEY:**
  - En Settings → API
  - Copia "service_role" key (¡NO la compartas públicamente!)

- **NEXTAUTH_URL:**
  - Después de crear el servicio en Render, copia la URL
  - Ejemplo: `https://sistema-asistencias-cpfp6.onrender.com`

- **NEXTAUTH_SECRET:**
  - Genera un string aleatorio largo
  - Puedes usar: https://generate-secret.vercel.app/32

---

## 📝 Instrucciones Paso a Paso en Render

### 1. Ve a tu servicio en Render
   - Dashboard → Tu servicio → "Environment"

### 2. Agrega cada variable una por una:
   - Haz clic en **"Add Environment Variable"**
   - **Key:** Pega el nombre de la variable (ej: `NEXT_PUBLIC_GOOGLE_SHEET_ID`)
   - **Value:** Pega el valor de la variable
   - Haz clic en **"Save Changes"**

### 3. Repite para todas las variables

### 4. Después de agregar todas, haz clic en **"Manual Deploy"** para aplicar los cambios

---

## ⚠️ Importante

- **Variables que empiezan con `NEXT_PUBLIC_`:** Son públicas y se exponen al cliente
- **Variables sin `NEXT_PUBLIC_`:** Son privadas y solo están en el servidor
- **Nunca compartas:** `SUPABASE_SERVICE_ROLE_KEY` o `NEXTAUTH_SECRET` públicamente
- **Después de agregar variables:** Siempre haz un nuevo deploy para que se apliquen

---

## ✅ Checklist

Antes de desplegar, verifica que tengas:

- [ ] Todas las variables necesarias agregadas
- [ ] `NEXTAUTH_URL` apunta a tu URL de Render
- [ ] `NEXTAUTH_SECRET` es un string largo y aleatorio
- [ ] Si usas Google Sheets: Sheet ID y API Key configurados
- [ ] Si usas Supabase: URL y keys configurados
- [ ] `NODE_ENV=production` configurado

---

## 🔄 Actualizar Variables

Si necesitas cambiar una variable:

1. Ve a Environment en Render
2. Encuentra la variable
3. Haz clic en el ícono de editar
4. Cambia el valor
5. Guarda
6. Haz un nuevo deploy


