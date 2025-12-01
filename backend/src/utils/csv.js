// Utilidades para exportar datos a CSV

// Convertir array de objetos a CSV
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Si no se proporcionan headers, usar las keys del primer objeto
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Crear la fila de headers
  const headerRow = csvHeaders.join(',');
  
  // Crear las filas de datos
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

// Formatear datos de asistencia para CSV
export const formatAttendanceForCSV = (attendances) => {
  return attendances.map(attendance => ({
    'Fecha': new Date(attendance.date).toLocaleDateString('es-AR'),
    'Curso': attendance.course.name,
    'División': attendance.course.division,
    'Año': attendance.course.year,
    'DNI': attendance.student.dni,
    'Apellido': attendance.student.lastName,
    'Nombre': attendance.student.firstName,
    'Estado': attendance.status,
    'Observaciones': attendance.notes || '',
    'Profesor': attendance.course.teacher.name
  }));
};

// Formatear datos de estudiantes para CSV
export const formatStudentsForCSV = (students) => {
  return students.map(student => ({
    'DNI': student.dni,
    'Apellido': student.lastName,
    'Nombre': student.firstName,
    'Email': student.email || '',
    'Teléfono': student.phone || '',
    'Dirección': student.address || '',
    'Fecha de Nacimiento': student.birthDate ? new Date(student.birthDate).toLocaleDateString('es-AR') : '',
    'Estado': student.isActive ? 'Activo' : 'Inactivo',
    'Fecha de Registro': new Date(student.createdAt).toLocaleDateString('es-AR')
  }));
};

// Formatear datos de cursos para CSV
export const formatCoursesForCSV = (courses) => {
  return courses.map(course => ({
    'Nombre': course.name,
    'Descripción': course.description || '',
    'Año': course.year,
    'División': course.division,
    'Profesor': course.teacher.name,
    'Estudiantes Inscriptos': course._count?.enrollments || 0,
    'Estado': course.isActive ? 'Activo' : 'Inactivo',
    'Fecha de Creación': new Date(course.createdAt).toLocaleDateString('es-AR')
  }));
};
