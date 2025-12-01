import { prisma } from '../index.js';
import { validateData, studentSchema } from '../utils/validation.js';
import { createError } from '../middleware/errorHandler.js';

// Obtener todos los estudiantes
export const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, courseId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { dni: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(courseId && {
        enrollments: {
          some: {
            courseId,
            isActive: true
          }
        }
      })
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          enrollments: {
            where: { isActive: true },
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  year: true,
                  division: true
                }
              }
            }
          },
          _count: {
            select: {
              attendances: true
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.student.count({ where })
    ]);

    res.json({
      students,
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

// Obtener estudiante por ID
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        enrollments: {
          where: { isActive: true },
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
          }
        },
        attendances: {
          include: {
            course: {
              select: {
                name: true,
                year: true,
                division: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 20
        }
      }
    });

    if (!student) {
      throw createError(404, 'Estudiante no encontrado');
    }

    res.json({ student });

  } catch (error) {
    next(error);
  }
};

// Crear nuevo estudiante
export const createStudent = async (req, res, next) => {
  try {
    // Validar datos
    const validatedData = validateData(studentSchema, req.body);
    const { dni, firstName, lastName, email, phone, address, birthDate } = validatedData;

    // Verificar que el DNI no existe
    const existingStudent = await prisma.student.findFirst({
      where: { dni }
    });

    if (existingStudent) {
      throw createError(400, 'Ya existe un estudiante con este DNI');
    }

    // Verificar email único si se proporciona
    if (email && email.trim() !== '') {
      const existingEmail = await prisma.student.findFirst({
        where: { 
          email: email.trim(),
          isActive: true
        }
      });

      if (existingEmail) {
        throw createError(400, 'Ya existe un estudiante con este email');
      }
    }

    const student = await prisma.student.create({
      data: {
        dni,
        firstName,
        lastName,
        email: email && email.trim() !== '' ? email.trim() : null,
        phone,
        address,
        birthDate: birthDate && birthDate.trim() !== '' ? new Date(birthDate) : null
      }
    });

    res.status(201).json({
      message: 'Estudiante creado exitosamente',
      student
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar estudiante
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el estudiante existe
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!existingStudent) {
      throw createError(404, 'Estudiante no encontrado');
    }

    // Validar datos (permitir actualizaciones parciales)
    const allowedFields = ['dni', 'firstName', 'lastName', 'email', 'phone', 'address', 'birthDate'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'email') {
          updateData[field] = req.body[field] && req.body[field].trim() !== '' ? req.body[field].trim() : null;
        } else if (field === 'birthDate') {
          updateData[field] = req.body[field] && req.body[field].trim() !== '' ? new Date(req.body[field]) : null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createError(400, 'Debe proporcionar al menos un campo para actualizar');
    }

    // Verificar DNI único si se está cambiando
    if (updateData.dni && updateData.dni !== existingStudent.dni) {
      const existingDNI = await prisma.student.findFirst({
        where: { 
          dni: updateData.dni,
          id: { not: id }
        }
      });

      if (existingDNI) {
        throw createError(400, 'Ya existe un estudiante con este DNI');
      }
    }

    // Verificar email único si se está cambiando
    if (updateData.email && updateData.email !== existingStudent.email) {
      const existingEmail = await prisma.student.findFirst({
        where: { 
          email: updateData.email,
          id: { not: id },
          isActive: true
        }
      });

      if (existingEmail) {
        throw createError(400, 'Ya existe un estudiante con este email');
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        enrollments: {
          where: { isActive: true },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                year: true,
                division: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Estudiante actualizado exitosamente',
      student: updatedStudent
    });

  } catch (error) {
    next(error);
  }
};

// Eliminar estudiante (soft delete)
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el estudiante existe
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!existingStudent) {
      throw createError(404, 'Estudiante no encontrado');
    }

    // Soft delete del estudiante y sus inscripciones
    await prisma.$transaction([
      prisma.student.update({
        where: { id },
        data: { isActive: false }
      }),
      prisma.enrollment.updateMany({
        where: { studentId: id },
        data: { isActive: false }
      })
    ]);

    res.json({
      message: 'Estudiante eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del estudiante
export const getStudentStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el estudiante existe
    const student = await prisma.student.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!student) {
      throw createError(404, 'Estudiante no encontrado');
    }

    // Obtener estadísticas
    const [
      totalCourses,
      totalAttendances,
      attendancesByStatus,
      attendanceRate
    ] = await Promise.all([
      // Total de cursos inscriptos
      prisma.enrollment.count({
        where: {
          studentId: id,
          isActive: true
        }
      }),
      
      // Total de asistencias registradas
      prisma.attendance.count({
        where: { studentId: id }
      }),
      
      // Asistencias por estado
      prisma.attendance.groupBy({
        by: ['status'],
        where: { studentId: id },
        _count: { status: true }
      }),
      
      // Calcular porcentaje de asistencia
      prisma.attendance.findMany({
        where: { studentId: id },
        select: { status: true }
      })
    ]);

    // Calcular porcentaje de asistencia
    const presentCount = attendanceRate.filter(a => a.status === 'PRESENTE').length;
    const attendancePercentage = attendanceRate.length > 0 
      ? Math.round((presentCount / attendanceRate.length) * 100) 
      : 0;

    const stats = {
      totalCourses,
      totalAttendances,
      attendancesByStatus: attendancesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      attendancePercentage
    };

    res.json({ stats });

  } catch (error) {
    next(error);
  }
};
