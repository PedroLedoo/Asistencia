import { prisma } from '../index.js';
import { validateData, attendanceSchema, bulkAttendanceSchema } from '../utils/validation.js';
import { createError } from '../middleware/errorHandler.js';
import { arrayToCSV, formatAttendanceForCSV } from '../utils/csv.js';

// Obtener asistencias
export const getAttendances = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      courseId, 
      studentId, 
      date, 
      dateFrom, 
      dateTo,
      status 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      ...(courseId && { courseId }),
      ...(studentId && { studentId }),
      ...(status && { status }),
      ...(date && { 
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z')
        }
      }),
      ...(dateFrom && dateTo && {
        date: {
          gte: new Date(dateFrom + 'T00:00:00.000Z'),
          lte: new Date(dateTo + 'T23:59:59.999Z')
        }
      })
    };

    // Si es profesor, solo mostrar asistencias de sus cursos
    if (req.user.role === 'PROFESOR') {
      where.course = {
        teacherId: req.user.id,
        isActive: true
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              dni: true,
              firstName: true,
              lastName: true
            }
          },
          course: {
            select: {
              id: true,
              name: true,
              year: true,
              division: true,
              teacher: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { course: { name: 'asc' } },
          { student: { lastName: 'asc' } }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.attendance.count({ where })
    ]);

    res.json({
      attendances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
};

// Crear asistencia individual
export const createAttendance = async (req, res, next) => {
  try {
    // Validar datos
    const { studentId, courseId, date, status, notes } = validateData(attendanceSchema, req.body);

    // Verificar que el curso existe y el usuario tiene permisos
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
        ...(req.user.role === 'PROFESOR' && { teacherId: req.user.id })
      }
    });

    if (!course) {
      throw createError(404, 'Curso no encontrado o sin permisos');
    }

    // Verificar que el estudiante está inscripto en el curso
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        isActive: true
      }
    });

    if (!enrollment) {
      throw createError(400, 'El estudiante no está inscripto en este curso');
    }

    // Verificar que no existe asistencia para esta fecha
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        courseId,
        date: new Date(date)
      }
    });

    if (existingAttendance) {
      throw createError(400, 'Ya existe un registro de asistencia para esta fecha');
    }

    // Crear asistencia
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        courseId,
        date: new Date(date),
        status,
        notes
      },
      include: {
        student: {
          select: {
            id: true,
            dni: true,
            firstName: true,
            lastName: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            year: true,
            division: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Asistencia registrada exitosamente',
      attendance
    });

  } catch (error) {
    next(error);
  }
};

// Crear múltiples asistencias (para una fecha y curso)
export const createBulkAttendance = async (req, res, next) => {
  try {
    // Validar datos
    const { courseId, date, attendances } = validateData(bulkAttendanceSchema, req.body);

    // Verificar que el curso existe y el usuario tiene permisos
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
        ...(req.user.role === 'PROFESOR' && { teacherId: req.user.id })
      }
    });

    if (!course) {
      throw createError(404, 'Curso no encontrado o sin permisos');
    }

    // Obtener estudiantes inscriptos en el curso
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        isActive: true
      },
      select: {
        studentId: true
      }
    });

    const enrolledStudentIds = enrollments.map(e => e.studentId);
    const attendanceStudentIds = attendances.map(a => a.studentId);

    // Verificar que todos los estudiantes están inscriptos
    const notEnrolledStudents = attendanceStudentIds.filter(id => !enrolledStudentIds.includes(id));
    if (notEnrolledStudents.length > 0) {
      throw createError(400, 'Algunos estudiantes no están inscriptos en este curso');
    }

    // Verificar que no existen asistencias para esta fecha
    const existingAttendances = await prisma.attendance.findMany({
      where: {
        courseId,
        date: new Date(date),
        studentId: { in: attendanceStudentIds }
      }
    });

    if (existingAttendances.length > 0) {
      throw createError(400, 'Ya existen registros de asistencia para algunos estudiantes en esta fecha');
    }

    // Preparar datos para inserción
    const attendanceData = attendances.map(attendance => ({
      studentId: attendance.studentId,
      courseId,
      date: new Date(date),
      status: attendance.status,
      notes: attendance.notes
    }));

    // Crear asistencias en lote
    const result = await prisma.attendance.createMany({
      data: attendanceData
    });

    res.status(201).json({
      message: `${result.count} asistencias registradas exitosamente`,
      count: result.count
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar asistencia
export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status && notes === undefined) {
      throw createError(400, 'Debe proporcionar al menos un campo para actualizar');
    }

    // Verificar que la asistencia existe y el usuario tiene permisos
    const existingAttendance = await prisma.attendance.findFirst({
      where: { id },
      include: {
        course: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingAttendance) {
      throw createError(404, 'Asistencia no encontrada');
    }

    // Verificar permisos si es profesor
    if (req.user.role === 'PROFESOR' && existingAttendance.course.teacherId !== req.user.id) {
      throw createError(403, 'No tienes permisos para modificar esta asistencia');
    }

    // Actualizar asistencia
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      },
      include: {
        student: {
          select: {
            id: true,
            dni: true,
            firstName: true,
            lastName: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            year: true,
            division: true
          }
        }
      }
    });

    res.json({
      message: 'Asistencia actualizada exitosamente',
      attendance: updatedAttendance
    });

  } catch (error) {
    next(error);
  }
};

// Eliminar asistencia
export const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la asistencia existe y el usuario tiene permisos
    const existingAttendance = await prisma.attendance.findFirst({
      where: { id },
      include: {
        course: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingAttendance) {
      throw createError(404, 'Asistencia no encontrada');
    }

    // Verificar permisos si es profesor
    if (req.user.role === 'PROFESOR' && existingAttendance.course.teacherId !== req.user.id) {
      throw createError(403, 'No tienes permisos para eliminar esta asistencia');
    }

    // Eliminar asistencia
    await prisma.attendance.delete({
      where: { id }
    });

    res.json({
      message: 'Asistencia eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// Obtener asistencias de un estudiante
export const getStudentAttendances = async (req, res, next) => {
  try {
    const { id: studentId } = req.params;
    const { courseId, dateFrom, dateTo } = req.query;

    // Construir filtros
    const where = {
      studentId,
      ...(courseId && { courseId }),
      ...(dateFrom && dateTo && {
        date: {
          gte: new Date(dateFrom + 'T00:00:00.000Z'),
          lte: new Date(dateTo + 'T23:59:59.999Z')
        }
      })
    };

    // Si es profesor, solo mostrar asistencias de sus cursos
    if (req.user.role === 'PROFESOR') {
      where.course = {
        teacherId: req.user.id,
        isActive: true
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            year: true,
            division: true,
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ attendances });

  } catch (error) {
    next(error);
  }
};

// Exportar asistencias a CSV
export const exportAttendances = async (req, res, next) => {
  try {
    const { courseId, dateFrom, dateTo, format = 'csv' } = req.query;

    // Construir filtros
    const where = {
      ...(courseId && { courseId }),
      ...(dateFrom && dateTo && {
        date: {
          gte: new Date(dateFrom + 'T00:00:00.000Z'),
          lte: new Date(dateTo + 'T23:59:59.999Z')
        }
      })
    };

    // Si es profesor, solo exportar asistencias de sus cursos
    if (req.user.role === 'PROFESOR') {
      where.course = {
        teacherId: req.user.id,
        isActive: true
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            dni: true,
            firstName: true,
            lastName: true
          }
        },
        course: {
          select: {
            name: true,
            year: true,
            division: true,
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { course: { name: 'asc' } },
        { student: { lastName: 'asc' } }
      ]
    });

    if (format === 'csv') {
      const csvData = formatAttendanceForCSV(attendances);
      const csv = arrayToCSV(csvData);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="asistencias.csv"');
      res.send('\ufeff' + csv); // BOM para UTF-8
    } else {
      res.json({ attendances });
    }

  } catch (error) {
    next(error);
  }
};

// Obtener resumen de asistencias por curso y fecha
export const getAttendanceSummary = async (req, res, next) => {
  try {
    const { courseId, date } = req.query;

    if (!courseId || !date) {
      throw createError(400, 'ID del curso y fecha son requeridos');
    }

    // Verificar que el curso existe y el usuario tiene permisos
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
        ...(req.user.role === 'PROFESOR' && { teacherId: req.user.id })
      },
      include: {
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                dni: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        }
      }
    });

    if (!course) {
      throw createError(404, 'Curso no encontrado o sin permisos');
    }

    // Obtener asistencias para la fecha específica
    const attendances = await prisma.attendance.findMany({
      where: {
        courseId,
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z')
        }
      }
    });

    // Crear mapa de asistencias por estudiante
    const attendanceMap = attendances.reduce((acc, attendance) => {
      acc[attendance.studentId] = attendance;
      return acc;
    }, {});

    // Combinar estudiantes con sus asistencias
    const summary = course.enrollments.map(enrollment => ({
      student: enrollment.student,
      attendance: attendanceMap[enrollment.student.id] || null
    }));

    res.json({
      course: {
        id: course.id,
        name: course.name,
        year: course.year,
        division: course.division
      },
      date,
      summary,
      stats: {
        totalStudents: summary.length,
        withAttendance: summary.filter(s => s.attendance).length,
        withoutAttendance: summary.filter(s => !s.attendance).length
      }
    });

  } catch (error) {
    next(error);
  }
};
