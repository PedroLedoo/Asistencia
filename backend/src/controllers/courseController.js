import { prisma } from '../index.js';
import { validateData, courseSchema } from '../utils/validation.js';
import { createError } from '../middleware/errorHandler.js';

// Obtener todos los cursos
export const getCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, teacherId, year } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { division: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(teacherId && { teacherId }),
      ...(year && { year: parseInt(year) })
    };

    // Si es profesor, solo mostrar sus cursos
    if (req.user.role === 'PROFESOR') {
      where.teacherId = req.user.id;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              attendances: true
            }
          }
        },
        orderBy: [
          { year: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      courses,
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

// Obtener curso por ID
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const where = {
      id,
      isActive: true
    };

    // Si es profesor, solo puede ver sus cursos
    if (req.user.role === 'PROFESOR') {
      where.teacherId = req.user.id;
    }

    const course = await prisma.course.findFirst({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                dni: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            attendances: true
          }
        }
      }
    });

    if (!course) {
      throw createError(404, 'Curso no encontrado');
    }

    res.json({ course });

  } catch (error) {
    next(error);
  }
};

// Crear nuevo curso
export const createCourse = async (req, res, next) => {
  try {
    // Validar datos
    const validatedData = validateData(courseSchema, req.body);
    const { name, description, year, division, teacherId } = validatedData;

    // Si no se especifica teacherId y el usuario es profesor, asignarlo a él
    const finalTeacherId = teacherId || (req.user.role === 'PROFESOR' ? req.user.id : null);

    if (!finalTeacherId) {
      throw createError(400, 'ID del profesor es requerido');
    }

    // Verificar que el profesor existe
    const teacher = await prisma.user.findFirst({
      where: {
        id: finalTeacherId,
        role: { in: ['PROFESOR', 'ADMIN'] },
        isActive: true
      }
    });

    if (!teacher) {
      throw createError(404, 'Profesor no encontrado');
    }

    // Verificar que no existe un curso con el mismo nombre, año y división
    const existingCourse = await prisma.course.findFirst({
      where: {
        name,
        year,
        division,
        isActive: true
      }
    });

    if (existingCourse) {
      throw createError(400, 'Ya existe un curso con el mismo nombre, año y división');
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        year,
        division,
        teacherId: finalTeacherId
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Curso creado exitosamente',
      course
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar curso
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el curso existe y el usuario tiene permisos
    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        isActive: true,
        ...(req.user.role === 'PROFESOR' && { teacherId: req.user.id })
      }
    });

    if (!existingCourse) {
      throw createError(404, 'Curso no encontrado o sin permisos');
    }

    // Validar datos (permitir actualizaciones parciales)
    const allowedFields = ['name', 'description', 'year', 'division', 'teacherId'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createError(400, 'Debe proporcionar al menos un campo para actualizar');
    }

    // Si se está cambiando el profesor, verificar que existe
    if (updateData.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: {
          id: updateData.teacherId,
          role: { in: ['PROFESOR', 'ADMIN'] },
          isActive: true
        }
      });

      if (!teacher) {
        throw createError(404, 'Profesor no encontrado');
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    res.json({
      message: 'Curso actualizado exitosamente',
      course: updatedCourse
    });

  } catch (error) {
    next(error);
  }
};

// Eliminar curso (soft delete)
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el curso existe y el usuario tiene permisos
    const existingCourse = await prisma.course.findFirst({
      where: {
        id,
        isActive: true,
        ...(req.user.role === 'PROFESOR' && { teacherId: req.user.id })
      }
    });

    if (!existingCourse) {
      throw createError(404, 'Curso no encontrado o sin permisos');
    }

    // Soft delete
    await prisma.course.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Curso eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del curso
export const getCourseStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    const course = await prisma.course.findFirst({
      where: {
        id,
        isActive: true,
        ...(req.user.role === 'PROFESOR' && { teacherId: req.user.id })
      }
    });

    if (!course) {
      throw createError(404, 'Curso no encontrado o sin permisos');
    }

    // Obtener estadísticas
    const [
      totalStudents,
      totalAttendances,
      attendancesByStatus,
      recentAttendances
    ] = await Promise.all([
      // Total de estudiantes inscriptos
      prisma.enrollment.count({
        where: {
          courseId: id,
          isActive: true
        }
      }),
      
      // Total de asistencias registradas
      prisma.attendance.count({
        where: { courseId: id }
      }),
      
      // Asistencias por estado
      prisma.attendance.groupBy({
        by: ['status'],
        where: { courseId: id },
        _count: { status: true }
      }),
      
      // Asistencias recientes (últimos 7 días)
      prisma.attendance.findMany({
        where: {
          courseId: id,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      })
    ]);

    const stats = {
      totalStudents,
      totalAttendances,
      attendancesByStatus: attendancesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      recentAttendances
    };

    res.json({ stats });

  } catch (error) {
    next(error);
  }
};
