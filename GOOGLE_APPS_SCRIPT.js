/**
 * Google Apps Script para escribir datos en Google Sheets
 * 
 * INSTRUCCIONES:
 * 1. Abre tu hoja de Google Sheets
 * 2. Ve a Extensiones > Apps Script
 * 3. Pega este código completo
 * 4. Guarda el proyecto (Ctrl+S o Cmd+S)
 * 5. Despliega como aplicación web (Desplegar > Nueva implementación)
 * 6. Configura:
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquiera
 * 7. Copia la URL de la aplicación web
 * 8. Agrégala a tu .env.local como NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
 */

// ID de tu hoja de cálculo (lo obtienes de la URL de Google Sheets)
// Ejemplo: https://docs.google.com/spreadsheets/d/ESTE_ES_TU_SHEET_ID/edit
const SPREADSHEET_ID = 'TU_SHEET_ID_AQUI'; // ⚠️ REEMPLAZA ESTO CON TU ID

// Nombres de las hojas en tu Google Sheet
const SHEETS = {
  PROFESORES: 'Profesores',
  CURSOS: 'Cursos',
  ALUMNOS: 'Alumnos',
  ASISTENCIAS: 'Asistencias'
};

/**
 * Función principal que se ejecuta cuando se hace una petición POST
 */
function doPost(e) {
  try {
    // Obtener los parámetros de la petición
    const sheetName = e.parameter.sheet;
    const dataParam = e.parameter.data;
    const append = e.parameter.append === 'true';

    if (!sheetName || !dataParam) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Faltan parámetros: sheet y data son requeridos'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Parsear los datos
    const data = JSON.parse(dataParam);
    
    // Obtener la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(sheetName);

    // Si la hoja no existe, crearla
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      // Agregar encabezados según la hoja
      setHeaders(sheet, sheetName);
    }

    // Escribir los datos
    if (append) {
      // Agregar al final
      sheet.appendRow(data);
    } else {
      // Escribir en una fila específica (no implementado por ahora)
      sheet.appendRow(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Datos escritos correctamente'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función para manejar peticiones GET (útil para pruebas)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Apps Script está funcionando correctamente',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Configurar encabezados según el tipo de hoja
 */
function setHeaders(sheet, sheetName) {
  let headers = [];

  switch (sheetName) {
    case SHEETS.PROFESORES:
      headers = ['id', 'nombre', 'email', 'creado_en'];
      break;
    case SHEETS.CURSOS:
      headers = ['id', 'nombre', 'profesor_id', 'creado_en'];
      break;
    case SHEETS.ALUMNOS:
      headers = ['id', 'nombre', 'apellido', 'dni', 'curso_id', 'creado_en'];
      break;
    case SHEETS.ASISTENCIAS:
      headers = ['id', 'alumno_id', 'fecha', 'estado', 'cargado_por', 'creado_en'];
      break;
    default:
      // Si no coincide, no agregar encabezados
      return;
  }

  // Escribir encabezados en la primera fila
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatear encabezados (negrita, fondo gris)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f0f0f0');
  headerRange.setFontSize(11);
}

/**
 * Función de prueba para verificar que todo funciona
 */
function test() {
  const testData = [
    'test_id',
    'Test',
    'Apellido Test',
    '12345678',
    'test_curso_id',
    new Date().toISOString()
  ];

  const e = {
    parameter: {
      sheet: 'Alumnos',
      data: JSON.stringify(testData),
      append: 'true'
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}

