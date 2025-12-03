# 🔍 Debug: No puedo crear cursos

## Pasos para diagnosticar el problema

### 1. Abrir la Consola del Navegador

1. Abre tu aplicación
2. Presiona **F12** para abrir las herramientas de desarrollador
3. Ve a la pestaña **"Console"**

### 2. Intentar Crear un Curso

1. Ve a "Nuevo Curso"
2. Ingresa un nombre
3. Haz clic en "Crear Curso"
4. **Observa los mensajes en la consola**

### 3. Verificar los Errores

Busca mensajes que empiecen con:
- `Error al crear curso:`
- `Error de respuesta de Apps Script:`
- `Error al escribir curso en Google Sheets:`

## Errores Comunes y Soluciones

### Error 1: "Google Apps Script URL no configurada"

**Síntoma:**
```
Error al crear el curso: Google Apps Script URL no configurada. Necesitas configurar NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL para escribir datos.
```

**Solución:**
1. Verifica que `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` esté configurada en Render
2. Ve a tu servicio en Render → Environment
3. Agrega la variable si no existe
4. Reinicia el servicio

### Error 2: "Error al escribir curso en Google Sheets (403)"

**Síntoma:**
```
Error al escribir curso en Google Sheets (403): ...
```

**Solución:**
1. Verifica que el Apps Script esté desplegado como "Aplicación web"
2. Verifica que "Quién tiene acceso" sea **"Cualquiera"**
3. Vuelve a desplegar el Apps Script si es necesario

### Error 3: "Error al escribir curso en Google Sheets (404)"

**Síntoma:**
```
Error al escribir curso en Google Sheets (404): ...
```

**Solución:**
1. Verifica que la URL del Apps Script sea correcta
2. Verifica que termine en `/exec`
3. Verifica que el Apps Script esté desplegado

### Error 4: "La hoja no existe: Cursos"

**Síntoma:**
```
Error: La hoja no existe: Cursos
```

**Solución:**
1. Abre tu Google Sheet
2. Verifica que exista una pestaña llamada **"Cursos"** (con C mayúscula)
3. Si no existe, créala

### Error 5: "Campo no encontrado"

**Síntoma:**
```
Error: Campo no encontrado: ...
```

**Solución:**
1. Abre tu Google Sheet
2. Ve a la hoja "Cursos"
3. Verifica que la primera fila tenga estos encabezados exactos:
   ```
   id | nombre | profesor_id | creado_en
   ```
4. Los encabezados deben estar en minúsculas

### Error 6: No aparece ningún error pero no se crea

**Síntoma:**
- No aparece error en la consola
- El botón se queda en "Creando Curso..."
- No se redirige a la página del curso

**Solución:**
1. Verifica en la consola si hay errores de red (pestaña Network)
2. Verifica que el Apps Script esté respondiendo:
   - Ve a Google Apps Script
   - Ve a "Ejecuciones" (Executions)
   - Deberías ver ejecuciones cuando intentas crear un curso
3. Verifica que el `SPREADSHEET_ID` en el Apps Script sea correcto

## Verificación Rápida

### Checklist

- [ ] `NEXT_PUBLIC_GOOGLE_SHEET_ID` está configurada en Render
- [ ] `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` está configurada en Render
- [ ] El Apps Script está desplegado como "Aplicación web"
- [ ] "Quién tiene acceso" es "Cualquiera"
- [ ] El `SPREADSHEET_ID` en el Apps Script es correcto
- [ ] Existe la hoja "Cursos" en Google Sheets
- [ ] Los encabezados de "Cursos" son: `id | nombre | profesor_id | creado_en`
- [ ] La hoja es pública o tienes API Key configurada

## Probar el Apps Script Manualmente

1. Ve a Google Apps Script
2. Selecciona la función `test` en el menú desplegable
3. Haz clic en "Ejecutar" (▶️)
4. Revisa los logs en "Ejecuciones"
5. Verifica en Google Sheets que se haya creado una fila de prueba

## Verificar en Google Sheets

Después de intentar crear un curso:

1. Abre tu Google Sheet
2. Ve a la hoja "Cursos"
3. Verifica si se agregó una nueva fila
4. Si no se agregó, revisa los logs en Apps Script

## Contacto

Si después de verificar todo esto sigues teniendo problemas:

1. Copia el mensaje de error completo de la consola
2. Revisa los logs en Google Apps Script (Ver → Ejecuciones)
3. Verifica la configuración de variables de entorno en Render

