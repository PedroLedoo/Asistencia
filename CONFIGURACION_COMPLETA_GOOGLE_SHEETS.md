# 📋 Guía Completa: Configurar Google Sheets en Render

Esta guía te explica paso a paso cómo configurar Google Sheets como base de datos y desplegarlo en Render.

---

## 🎯 Parte 1: Configurar Google Sheets

### Paso 1.1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nombra el archivo: `Sistema Asistencias CPFP6` (o el nombre que prefieras)

### Paso 1.2: Crear las Hojas (Pestañas)

En la parte inferior de Google Sheets, crea estas 4 pestañas (hojas):

1. **Profesores**
2. **Cursos**
3. **Alumnos**
4. **Asistencias**

**Cómo crear una pestaña:**
- Haz clic en el botón `+` al final de las pestañas
- O haz clic derecho en una pestaña existente → "Insertar hoja"

### Paso 1.3: Configurar las Columnas

En cada hoja, la **primera fila** debe tener estos encabezados exactos:

#### Hoja "Profesores"
```
id | nombre | email | creado_en
```

#### Hoja "Cursos"
```
id | nombre | profesor_id | creado_en
```

#### Hoja "Alumnos"
```
id | nombre | apellido | dni | curso_id | creado_en
```

#### Hoja "Asistencias"
```
id | alumno_id | fecha | estado | cargado_por | creado_en
```

**Importante:**
- Los nombres de las columnas deben ser **exactamente** como se muestra (minúsculas)
- La primera fila siempre son los encabezados
- No dejes filas vacías al principio

### Paso 1.4: Hacer la Hoja Pública (Para Lectura)

1. En Google Sheets, haz clic en el botón **"Compartir"** (arriba a la derecha, botón azul)
2. Haz clic en **"Cambiar a cualquier persona con el enlace"**
3. Selecciona **"Lector"** (solo lectura)
4. Haz clic en **"Listo"**

**Nota:** Esto permite que la aplicación lea los datos. Para escribir datos, necesitarás Google Apps Script (ver siguiente sección).

### Paso 1.5: Obtener el ID de la Hoja

1. Mira la URL en la barra de direcciones de tu navegador
2. Se verá así:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit
   ```
3. El ID es la parte `ABC123XYZ456` (entre `/d/` y `/edit`)
4. **Copia este ID** - lo necesitarás más adelante

---

## 🔧 Parte 2: Configurar Google Apps Script (Para Escribir Datos)

### Paso 2.1: Abrir Apps Script

1. En tu Google Sheet, ve a **Extensiones > Apps Script**
2. Se abrirá una nueva pestaña con el editor de Apps Script

### Paso 2.2: Pegar el Código

1. **Elimina todo el código** que aparece por defecto
2. Abre el archivo `GOOGLE_APPS_SCRIPT.js` de tu proyecto
3. **Copia todo el contenido** del archivo
4. **Pega el código** en el editor de Apps Script

### Paso 2.3: Configurar el Sheet ID

1. En el código, busca esta línea (alrededor de la línea 20):
   ```javascript
   const SPREADSHEET_ID = 'TU_SHEET_ID_AQUI';
   ```
2. **Reemplaza `TU_SHEET_ID_AQUI`** con el ID que copiaste en el Paso 1.5
   ```javascript
   const SPREADSHEET_ID = 'ABC123XYZ456'; // Tu ID real aquí
   ```
3. **Guarda el proyecto:**
   - Presiona `Ctrl+S` (Windows) o `Cmd+S` (Mac)
   - Dale un nombre al proyecto, por ejemplo: "Sistema Asistencias API"

### Paso 2.4: Desplegar como Aplicación Web

1. En Apps Script, haz clic en **"Desplegar"** (Deploy) en la esquina superior derecha
2. Selecciona **"Nueva implementación"** (New deployment)
3. En **"Tipo"** (Type), selecciona **"Aplicación web"** (Web app)
4. Configura:
   - **Descripción:** (opcional) "API para Sistema de Asistencias"
   - **Ejecutar como:** "Yo" (tu cuenta de Google)
   - **Quién tiene acceso:** **"Cualquiera"** (Anyone) ⚠️ **MUY IMPORTANTE**
5. Haz clic en **"Desplegar"** (Deploy)

### Paso 2.5: Autorizar el Acceso

1. Si es la primera vez, te pedirá autorizar el acceso
2. Haz clic en **"Autorizar acceso"**
3. Selecciona tu cuenta de Google
4. Si aparece una advertencia de "Google no ha verificado esta app":
   - Haz clic en **"Avanzado"**
   - Haz clic en **"Ir a [nombre del proyecto] (no seguro)"**
5. Haz clic en **"Permitir"**

### Paso 2.6: Copiar la URL de la Aplicación Web

1. Después de desplegar, verás una URL que termina en `/exec`
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
2. **Copia esta URL completa** - la necesitarás para Render

---

## 🚀 Parte 3: Configurar Variables de Entorno en Render

### Paso 3.1: Acceder a Render

1. Ve a [Render](https://render.com)
2. Inicia sesión o crea una cuenta
3. Ve a tu Dashboard

### Paso 3.2: Seleccionar tu Servicio

1. En el Dashboard, encuentra tu servicio (Web Service)
2. Haz clic en el nombre del servicio

### Paso 3.3: Ir a la Configuración de Variables de Entorno

1. En el menú lateral, haz clic en **"Environment"** (Entorno)
2. O ve directamente a la sección **"Environment Variables"**

### Paso 3.4: Agregar las Variables

Haz clic en **"Add Environment Variable"** y agrega estas variables una por una:

#### Variable 1: Google Sheet ID
- **Key:** `NEXT_PUBLIC_GOOGLE_SHEET_ID`
- **Value:** El ID que copiaste en el Paso 1.5 (ej: `ABC123XYZ456`)
- Haz clic en **"Save Changes"**

#### Variable 2: Google Apps Script URL
- **Key:** `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
- **Value:** La URL que copiaste en el Paso 2.6 (ej: `https://script.google.com/macros/s/AKfycby.../exec`)
- Haz clic en **"Save Changes"**

#### Variable 3: (Opcional) Google API Key
- **Key:** `NEXT_PUBLIC_GOOGLE_API_KEY`
- **Value:** Solo si tienes una API Key de Google (no es necesario si la hoja es pública)
- Haz clic en **"Save Changes"**

### Paso 3.5: Verificar que no hay Variables de Supabase

Si estás usando solo Google Sheets, asegúrate de que **NO** tengas estas variables configuradas (o que tengan valores de prueba):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Si las tienes con valores reales, Render usará Supabase en lugar de Google Sheets.

### Paso 3.6: Reiniciar el Servicio

1. Después de agregar todas las variables, ve a la pestaña **"Events"** o **"Logs"**
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. O simplemente espera a que Render detecte los cambios y despliegue automáticamente

---

## ✅ Parte 4: Verificar que Todo Funciona

### Verificación 1: En Render

1. Ve a la pestaña **"Logs"** de tu servicio en Render
2. Verifica que no haya errores relacionados con Google Sheets
3. El build debe completarse exitosamente

### Verificación 2: En tu Aplicación

1. Abre tu aplicación desplegada en Render
2. Intenta crear un curso nuevo
3. Abre tu Google Sheet y verifica que el curso aparezca en la hoja "Cursos"
4. Intenta agregar un alumno
5. Verifica que el alumno aparezca en la hoja "Alumnos"

### Verificación 3: En Google Apps Script

1. Ve a tu Google Sheet
2. Ve a **Extensiones > Apps Script**
3. En el menú lateral, haz clic en **"Ejecuciones"** (Executions)
4. Deberías ver las ejecuciones cuando creas/eliminas datos desde la aplicación

---

## 🔍 Solución de Problemas

### Error: "Google Sheet ID no configurado"

**Solución:**
- Verifica que `NEXT_PUBLIC_GOOGLE_SHEET_ID` esté configurada en Render
- Verifica que el valor sea correcto (sin espacios, sin comillas)

### Error: "Google Apps Script URL no configurada"

**Solución:**
- Verifica que `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` esté configurada en Render
- Verifica que la URL sea correcta y termine en `/exec`
- Verifica que el Apps Script esté desplegado como "Aplicación web"

### Error: "Error al leer Google Sheets"

**Solución:**
- Verifica que la hoja sea pública (Paso 1.4)
- Verifica que los nombres de las hojas sean exactos: `Cursos`, `Alumnos`, `Profesores`, `Asistencias`
- Verifica que los encabezados de las columnas sean correctos

### Error: "Error al escribir en Google Sheets"

**Solución:**
- Verifica que el Apps Script esté desplegado correctamente
- Verifica que "Quién tiene acceso" sea "Cualquiera"
- Verifica que el `SPREADSHEET_ID` en el Apps Script sea correcto
- Revisa los logs en Apps Script (Ver → Ejecuciones)

### Los datos no aparecen después de crear

**Solución:**
- Espera unos segundos (la sincronización puede tardar)
- Recarga la página
- Verifica en Google Sheets directamente que los datos se hayan guardado
- Revisa la consola del navegador (F12) para ver errores

---

## 📝 Resumen de Variables de Entorno en Render

```
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id_aqui
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key (opcional, solo si la hoja es privada)
```

---

## 🎉 ¡Listo!

Una vez configurado todo, tu aplicación podrá:
- ✅ Leer datos desde Google Sheets
- ✅ Crear cursos desde la página
- ✅ Agregar/eliminar alumnos desde la página
- ✅ Guardar asistencias en Google Sheets
- ✅ Todo se sincroniza automáticamente

Si tienes problemas, revisa la sección de "Solución de Problemas" o los logs en Render y Google Apps Script.

