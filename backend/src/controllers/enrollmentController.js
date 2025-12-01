import { prisma } from '../index.js';
import { validateData, enrollmentSchema } from '../utils/validation.js';
import { createError } from '../middleware/errorHandler.js';

// Obtener inscripciones
export const getEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, courseId, studentId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      isActive: true,
      ...(courseId && { courseId }),
      ...(studentId && { studentId })
    };

    // Si es profesor, solo mostrar inscripciones de sus cursos
    if (req.user.role === 'PROFESOR') {
      where.course = {
        teacherId: req.user.id,
        isActive: true
      };
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              dni: true,
              firstName: true,
              lastName: true,
              email: true
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
          { enrollDate: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.enrollment.count({ where })
    ]);

    res.json({
      enrollments,
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

// Crear nueva inscripción
export const createEnrollment = async (req, res, next) => {
  try {
    // Validar datos
    const { studentId, courseId } = validateData(enrollmentSchema, req.body);

    // Verificar que el estudiante existe y está activo
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        isActive: true
      }
    });

    if (!student) {
      throw createError(404, 'Estudiante no encontrado o inactivo');
    }

    // Verificar que el curso existe y está activo
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

    // Verificar que no existe una inscripción activa
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        isActive: true
      }
    });

    if (existingEnrollment) {
      throw createError(400, 'El estudiante ya está inscripto en este curso');
    }

    // Crear inscripción
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId
      },
      include: {
        student: {
          select: {
            id: true,
            dni: true,
            firstName: true,
            lastName: true,
            email: true
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
      }
    });

    res.status(201).json({
      message: 'Inscripción creada exitosamente',
      enrollment
    });

  } catch (error) {
    next(error);
  }
};

// Eliminar inscripción (soft delete)
export const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la inscripción existe
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        course: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingEnrollment) {
      throw createError(404, 'Inscripción no encontrada');
    }

    // Verificar permisos si es profesor
    if (req.user.role === 'PROFESOR' && existingEnrollment.course.teacherId !== req.user.id) {
      throw createError(403, 'No tienes permisos para eliminar esta inscripción');
    }

    // Soft delete
    await prisma.enrollment.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Inscripción eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// Inscribir múltiples estudiantes a un curso
export const bulkEnrollStudents = async (req, res, next) => {
  try {
    const { courseId, studentIds } = req.body;

    if (!courseId || !Array.isArray(studentIds) || studentIds.length === 0) {
      throw createError(400, 'ID del curso y lista de estudiantes son requeridos');
    }

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

    // Verificar que todos los estudiantes existen
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        isActive: true
      }
    });

    if (students.length !== studentIds.length) {
      throw createError(400, 'Algunos estudiantes no fueron encontrados o están inactivos');
    }

    // Obtener inscripciones existentes
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        studentId: { in: studentIds },
        isActive: true
      }
    });

    const existingStudentIds = existingEnrollments.map(e => e.studentId);
    const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));

    if (newStudentIds.length === 0) {
      throw createError(400, 'Todos los estudiantes ya están inscriptos en este curso');
    }

    // Crear inscripciones en lote
    const enrollmentData = newStudentIds.map(studentId => ({
      studentId,
      courseId
    }));

    const enrollments = await prisma.enrollment.createMany({
      data: enrollmentData
    });

    res.status(201).json({
      message: `${enrollments.count} estudiantes inscriptos exitosamente`,
      enrolled: enrollments.count,
      alreadyEnrolled: existingStudentIds.length
    });

  } catch (error) {
    next(error);
  }
};

// Obtener estudiantes disponibles para inscribir en un curso
export const getAvailableStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { search } = req.query;

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

    // Obtener estudiantes que NO están inscriptos en el curso
    const availableStudents = await prisma.student.findMany({
      where: {
        isActive: true,
        NOT: {
          enrollments: {
            some: {
              courseId,
              isActive: true
            }
          }
        },
        ...(search && {
          OR: [
            { dni: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        id: true,
        dni: true,
        firstName: true,
        lastName: true,
        email: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    res.json({
      students: availableStudents
    });

  } catch (error) {
    next(error);
  }
};
