# Configurar Google Sheets SIN API Key

Esta guía te explica cómo usar Google Sheets como base de datos **sin necesidad de crear una API Key de Google**.

## ✅ Ventajas de este método

- ✅ **No necesitas crear cuenta en Google Cloud Console**
- ✅ **No necesitas configurar API Key**
- ✅ **Más simple y rápido**
- ✅ **Funciona perfectamente para lectura de datos**

## ⚠️ Requisitos

- La hoja de Google Sheets **debe ser pública** (cualquier persona con el enlace puede verla)
- Solo funciona para **leer datos** (no para escribir directamente)

## 📋 Paso 1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nombra el archivo: `Sistema Asistencias CPFP6`
4. Crea estas 4 pestañas (hojas) en la parte inferior:
   - **Profesores**
   - **Cursos**
   - **Alumnos**
   - **Asistencias**

## 📊 Paso 2: Configurar las Columnas

En cada hoja, la **primera fila** debe tener estos encabezados:

### Hoja "Profesores"
```
id | nombre | email | creado_en
```

### Hoja "Cursos"
```
id | nombre | profesor_id | creado_en
```

### Hoja "Alumnos"
```
id | nombre | apellido | dni | curso_id | creado_en
```

### Hoja "Asistencias"
```
id | alumno_id | fecha | estado | cargado_por | creado_en
```

**Importante:** 
- Los nombres de las columnas deben ser **exactamente** como se muestra
- La primera fila siempre son los encabezados
- No dejes filas vacías al principio

## 🔑 Paso 3: Obtener el ID de la Hoja

1. Abre tu hoja de cálculo en Google Sheets
2. Mira la URL en el navegador. Se verá así:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit
   ```
3. El ID es la parte `ABC123XYZ456` (entre `/d/` y `/edit`)
4. **Copia ese ID** - lo necesitarás después

## 🔓 Paso 4: Hacer la Hoja Pública (MUY IMPORTANTE)

**Este paso es obligatorio** para que funcione sin API Key:

1. En Google Sheets, haz clic en el botón **"Compartir"** (arriba a la derecha, botón azul)

2. En la ventana que aparece, haz clic en **"Cambiar a cualquier persona con el enlace"**

3. Selecciona el permiso: **"Lector"** (solo lectura está bien)

4. Haz clic en **"Listo"**

5. **¡Listo!** Tu hoja ahora es pública y puede ser leída sin API Key

## ⚙️ Paso 5: Configurar en tu Proyecto

### En desarrollo local (.env.local):

Edita tu archivo `.env.local` y agrega **SOLO** esto:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=ABC123XYZ456
```

Reemplaza `ABC123XYZ456` con el ID que copiaste en el Paso 3.

**NO necesitas agregar:**
- ❌ `NEXT_PUBLIC_GOOGLE_API_KEY` (no es necesario)
- ❌ `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` (solo si quieres escribir datos)

### En Render (producción):

1. Ve a tu servicio en Render
2. Environment → Add Environment Variable
3. Agrega:
   - **Key:** `NEXT_PUBLIC_GOOGLE_SHEET_ID`
   - **Value:** Tu Sheet ID (el mismo que usaste en local)
4. Guarda y haz deploy

## ✅ Paso 6: Probar

1. Reinicia tu servidor: `npm run dev`
2. Ve a tu aplicación
3. Los datos deberían cargarse desde Google Sheets

## 📝 Paso 7: Agregar Datos Manualmente

Por ahora, puedes agregar datos directamente en Google Sheets:

1. Abre tu hoja de Google Sheets
2. Ve a la pestaña correspondiente (Profesores, Cursos, etc.)
3. Agrega una nueva fila con los datos
4. Los datos aparecerán automáticamente en tu aplicación al recargar

## 🔄 Para Escribir Datos (Opcional)

Si quieres que la aplicación pueda **escribir** datos en Google Sheets (no solo leer), necesitas configurar Google Apps Script. Ver `GOOGLE_SHEETS_SETUP.md` para las instrucciones.

## 🆘 Solución de Problemas

### Error: "Error al leer Google Sheets"
- **Solución:** Verifica que la hoja sea pública (Paso 4)
- Verifica que el Sheet ID sea correcto
- Verifica que los nombres de las pestañas sean exactos: `Profesores`, `Cursos`, `Alumnos`, `Asistencias`

### Los datos no aparecen
- **Solución:** 
  - Verifica que haya datos en las filas (no solo encabezados)
  - Verifica que los nombres de las columnas sean exactos
  - Verifica que no haya filas vacías al principio

### La hoja no es pública
- **Solución:** 
  - Ve a Compartir → Cambiar a cualquier persona con el enlace
  - Selecciona "Lector"
  - Guarda

## 📋 Checklist

Antes de usar, verifica:

- [ ] Hoja creada con las 4 pestañas: Profesores, Cursos, Alumnos, Asistencias
- [ ] Encabezados configurados correctamente en cada pestaña
- [ ] Hoja hecha pública (Compartir → Cualquier persona con el enlace)
- [ ] Sheet ID copiado de la URL
- [ ] Variable `NEXT_PUBLIC_GOOGLE_SHEET_ID` agregada en `.env.local`
- [ ] Servidor reiniciado después de agregar la variable

## 💡 Ejemplo de Datos

Puedes empezar agregando datos de prueba directamente en Google Sheets:

**Hoja "Profesores":**
```
id | nombre | email | creado_en
prof_1 | Juan Pérez | juan@example.com | 2024-01-01
```

**Hoja "Cursos":**
```
id | nombre | profesor_id | creado_en
curso_1 | Programación Web | prof_1 | 2024-01-01
```

¡Y así sucesivamente!

