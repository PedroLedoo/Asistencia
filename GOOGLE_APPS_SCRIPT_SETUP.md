# 📝 Guía Completa: Configurar Google Apps Script para Escribir en Google Sheets

Esta guía te ayudará a configurar Google Apps Script para que tu aplicación pueda escribir datos (agregar alumnos, asistencias, etc.) en Google Sheets.

## 🎯 Paso 1: Obtener el ID de tu Hoja de Cálculo

1. Abre tu hoja de Google Sheets
2. Mira la URL en la barra de direcciones:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_TU_SHEET_ID/edit
   ```
3. Copia el `SHEET_ID` (la parte larga entre `/d/` y `/edit`)

## 📋 Paso 2: Crear el Script de Apps Script

1. **Abre tu hoja de Google Sheets**
2. **Ve a Extensiones > Apps Script** (o Extensions > Apps Script)
3. **Elimina todo el código que aparece por defecto**
4. **Copia y pega el código completo del archivo `GOOGLE_APPS_SCRIPT.js`**
5. **⚠️ IMPORTANTE: Reemplaza `TU_SHEET_ID_AQUI` con tu ID real**
   ```javascript
   const SPREADSHEET_ID = 'tu_id_real_aqui';
   ```
6. **Guarda el proyecto:**
   - Presiona `Ctrl+S` (Windows) o `Cmd+S` (Mac)
   - Dale un nombre al proyecto, por ejemplo: "Sistema Asistencias API"

## 🚀 Paso 3: Desplegar como Aplicación Web

1. **Haz clic en "Desplegar" (Deploy) en la esquina superior derecha**
2. **Selecciona "Nueva implementación" (New deployment)**
3. **En "Tipo" (Type), selecciona "Aplicación web" (Web app)**
4. **Configura los siguientes parámetros:**
   - **Descripción:** (opcional) "API para Sistema de Asistencias"
   - **Ejecutar como:** "Yo" (tu cuenta de Google)
   - **Quién tiene acceso:** "Cualquiera" (Anyone)
     - ⚠️ Esto es necesario para que tu aplicación pueda hacer peticiones
5. **Haz clic en "Desplegar" (Deploy)**
6. **Autoriza el acceso:**
   - Si es la primera vez, te pedirá autorizar el acceso
   - Haz clic en "Autorizar acceso"
   - Selecciona tu cuenta de Google
   - Haz clic en "Avanzado" si aparece una advertencia
   - Haz clic en "Ir a [nombre del proyecto] (no seguro)"
   - Haz clic en "Permitir"
7. **Copia la URL de la aplicación web:**
   - Verás una URL que termina en `/exec`
   - Ejemplo: `https://script.google.com/macros/s/AKfycby.../exec`
   - **Copia esta URL completa**

## ⚙️ Paso 4: Configurar en tu Aplicación

1. **Abre tu archivo `.env.local`** en la raíz del proyecto
2. **Agrega la URL de Apps Script:**
   ```env
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycby.../exec
   ```
3. **Asegúrate de tener también configurado:**
   ```env
   NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id_aqui
   ```
4. **Guarda el archivo**

## ✅ Paso 5: Verificar que Funciona

1. **Reinicia tu servidor de desarrollo:**
   ```bash
   npm run dev
   ```
2. **Intenta agregar un alumno a un curso**
3. **Verifica en tu Google Sheet que el alumno se agregó correctamente**

## 🧪 Probar el Script Manualmente

Si quieres probar que el script funciona antes de usarlo en la app:

1. **En Apps Script, haz clic en la función `test` en el menú desplegable**
2. **Haz clic en el botón de "Ejecutar" (▶️)**
3. **Autoriza si es necesario**
4. **Revisa los logs:**
   - Ve a "Ejecuciones" (Executions) en el menú lateral
   - Deberías ver que la ejecución fue exitosa
5. **Verifica en tu Google Sheet:**
   - Deberías ver una fila de prueba en la hoja "Alumnos"

## 🔒 Seguridad

- **La URL de Apps Script es pública**, pero solo permite escribir en tu hoja específica
- **Solo puedes escribir datos**, no leer ni modificar datos existentes (a menos que modifiques el script)
- **Puedes revocar el acceso en cualquier momento** desde Apps Script > Desplegar > Gestionar implementaciones

## 🐛 Solución de Problemas

### Error: "Faltan parámetros"
- Verifica que estás enviando `sheet` y `data` en la petición
- Revisa la consola del navegador para ver el error exacto

### Error: "No se puede acceder a la hoja"
- Verifica que el `SPREADSHEET_ID` en el script es correcto
- Asegúrate de que la hoja existe y tienes permisos de edición

### Error: "No se puede ejecutar doPost"
- Verifica que desplegaste como "Aplicación web"
- Verifica que configuraste "Quién tiene acceso" como "Cualquiera"

### Los datos no aparecen en la hoja
- Verifica que la hoja existe en tu Google Sheet
- Verifica que el nombre de la hoja coincide exactamente (mayúsculas/minúsculas)
- Revisa los logs de ejecución en Apps Script

## 📚 Estructura de Datos Esperada

El script espera que los datos lleguen en este orden según la hoja:

### Alumnos
```javascript
['id', 'nombre', 'apellido', 'dni', 'curso_id', 'creado_en']
```

### Asistencias
```javascript
['id', 'alumno_id', 'fecha', 'estado', 'cargado_por', 'creado_en']
```

### Cursos
```javascript
['id', 'nombre', 'profesor_id', 'creado_en']
```

### Profesores
```javascript
['id', 'nombre', 'email', 'creado_en']
```

## 🎉 ¡Listo!

Una vez configurado, tu aplicación podrá:
- ✅ Agregar alumnos a cursos
- ✅ Registrar asistencias
- ✅ Crear nuevos cursos
- ✅ Y más...

Si tienes problemas, revisa los logs en Apps Script o la consola del navegador.

