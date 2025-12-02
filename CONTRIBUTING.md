# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Asistencias CPFP N°6!

## 🚀 Cómo Contribuir

### 1. Fork el Proyecto

1. Haz fork del repositorio
2. Clona tu fork: `git clone https://github.com/tu-usuario/sistema-asistencias-cpfp6.git`
3. Crea una rama: `git checkout -b feature/mi-funcionalidad`

### 2. Desarrollo

1. Instala dependencias: `npm install`
2. Crea un archivo `.env.local` con las variables necesarias (ver `env.local.example`)
3. Ejecuta el servidor de desarrollo: `npm run dev`
4. Realiza tus cambios

### 3. Commit

Sigue las convenciones de commits:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Cambios en build o herramientas

Ejemplo:
```bash
git commit -m "feat: agregar exportación a Excel"
```

### 4. Push y Pull Request

1. Push a tu rama: `git push origin feature/mi-funcionalidad`
2. Abre un Pull Request en GitHub
3. Describe claramente los cambios realizados

## 📋 Checklist antes de hacer PR

- [ ] El código sigue las convenciones del proyecto
- [ ] He ejecutado `npm run lint` sin errores
- [ ] He ejecutado `npm run type-check` sin errores
- [ ] He probado los cambios localmente
- [ ] He actualizado la documentación si es necesario
- [ ] He agregado comentarios donde sea necesario

## 🐛 Reportar Bugs

Usa el template de [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) para reportar bugs.

## 💡 Sugerir Funcionalidades

Usa el template de [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) para sugerir nuevas funcionalidades.

## 📝 Estándares de Código

- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de nombres de React/Next.js
- Comenta código complejo
- Mantén funciones pequeñas y enfocadas
- Usa componentes reutilizables cuando sea posible

## ❓ Preguntas

Si tienes preguntas, abre un issue o contacta a los mantenedores del proyecto.

¡Gracias por contribuir! 🎉

