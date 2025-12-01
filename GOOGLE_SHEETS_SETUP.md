# Configuración de Google Sheets como Base de Datos

Esta guía te explica cómo usar Google Sheets como base de datos para tu sistema de asistencias.

## 📋 Paso 1: Crear la Hoja de Cálculo en Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja de cálculo
2. Nombra el archivo: `Sistema Asistencias CPFP6`
3. Crea las siguientes hojas (pestañas) en la parte inferior:
   - **Profesores**
   - **Cursos**
   - **Alumnos**
   - **Asistencias**

## 📊 Paso 2: Configurar las Columnas

### Hoja "Profesores"
```
| id | nombre | email | creado_en |
```

### Hoja "Cursos"
```
| id | nombre | profesor_id | creado_en |
```

### Hoja "Alumnos"
```
| id | nombre | apellido | dni | curso_id | creado_en |
```

### Hoja "Asistencias"
```
| id | alumno_id | fecha | estado | cargado_por | creado_en |
```

**Importante:** La primera fila debe contener exactamente estos encabezados.

## 🔑 Paso 3: Obtener el ID de la Hoja

1. Abre tu hoja de cálculo en Google Sheets
2. Mira la URL en el navegador. Se verá así:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit
   ```
3. El ID es la parte `ABC123XYZ456` (entre `/d/` y `/edit`)
4. Copia ese ID

## 🔐 Paso 4: Configurar Permisos

### Opción A: Hoja Pública (Solo Lectura - Recomendado para empezar)

1. En Google Sheets, haz clic en **Compartir** (botón azul arriba a la derecha)
2. Haz clic en **"Cambiar a cualquier persona con el enlace"**
3. Selecciona **"Lector"** (solo lectura)
4. Copia el enlace

### Opción B: Hoja Privada con API Key (Lectura)

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**
4. Ve a **Credenciales** → **Crear credenciales** → **Clave de API**
5. Copia la clave de API

## ⚙️ Paso 5: Configurar Variables de Entorno

Edita tu archivo `.env.local` y agrega:

```env
# Google Sheets Configuration
NEXT_PUBLIC_GOOGLE_SHEET_ID=TU_SHEET_ID_AQUI
NEXT_PUBLIC_GOOGLE_API_KEY=TU_API_KEY_AQUI
```

Reemplaza:
- `TU_SHEET_ID_AQUI` con el ID que copiaste en el Paso 3
- `TU_API_KEY_AQUI` con tu API Key (si usas la Opción B)

## 📝 Paso 6: Usar Google Apps Script para Escribir Datos

Para poder **escribir** datos en Google Sheets desde la aplicación, necesitas configurar Google Apps Script:

1. En tu hoja de Google Sheets, ve a **Extensiones** → **Apps Script**
2. Pega este código:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(e.parameter.sheet);
    const data = JSON.parse(e.parameter.data);
    
    if (e.parameter.append === 'true') {
      sheet.appendRow(data);
    } else {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, data.length).setValues([data]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(e.parameter.sheet);
  const range = e.parameter.range || 'A:Z';
  const data = sheet.getRange(range).getValues();
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Guarda el proyecto (Ctrl+S)
4. Haz clic en **Desplegar** → **Nueva implementación**
5. Selecciona tipo: **Aplicación web**
6. Ejecuta como: **Yo**
7. Acceso: **Cualquier persona**
8. Haz clic en **Desplegar**
9. Copia la **URL de la aplicación web**

Agrega esta URL a tu `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=TU_URL_AQUI
```

## ✅ Paso 7: Probar la Conexión

1. Reinicia tu servidor: `npm run dev`
2. Ve a la página de reportes o dashboard
3. Los datos deberían cargarse desde Google Sheets

## 🔄 Sincronización

- **Lectura:** Los datos se leen directamente desde Google Sheets
- **Escritura:** Se usa Google Apps Script para escribir datos

## 📚 Estructura de Datos

Asegúrate de que tus hojas tengan exactamente estos encabezados en la primera fila:

**Profesores:**
- id, nombre, email, creado_en

**Cursos:**
- id, nombre, profesor_id, creado_en

**Alumnos:**
- id, nombre, apellido, dni, curso_id, creado_en

**Asistencias:**
- id, alumno_id, fecha, estado, cargado_por, creado_en

## 🆘 Solución de Problemas

**Error: "Google Sheet ID no configurado"**
- Verifica que `NEXT_PUBLIC_GOOGLE_SHEET_ID` esté en `.env.local`
- Reinicia el servidor después de agregar variables

**Error: "Error al leer Google Sheets"**
- Verifica que la hoja sea pública (Opción A) o que tengas la API Key correcta
- Verifica que el ID de la hoja sea correcto

**Los datos no aparecen:**
- Verifica que los encabezados de las columnas sean exactamente como se especifica
- Verifica que haya datos en las filas (no solo encabezados)

