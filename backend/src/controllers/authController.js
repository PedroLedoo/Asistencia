import { prisma } from '../index.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { validateData, loginSchema, registerSchema } from '../utils/validation.js';
import { createError } from '../middleware/errorHandler.js';

// Login de usuario
export const login = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const { email, password } = validateData(loginSchema, req.body);

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      throw createError(401, 'Credenciales inválidas');
    }

    if (!user.isActive) {
      throw createError(401, 'Usuario inactivo. Contacta al administrador.');
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, 'Credenciales inválidas');
    }

    // Generar token JWT
    const token = generateToken(user.id);

    // Respuesta exitosa (sin incluir la contraseña)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    next(error);
  }
};

// Registro de usuario (solo administradores)
export const register = async (req, res, next) => {
  try {
    // Validar datos de entrada
    const validatedData = validateData(registerSchema, req.body);
    const { email, password, name, role = 'PROFESOR' } = validatedData;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw createError(400, 'Ya existe un usuario con este email');
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });

  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        courses: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            year: true,
            division: true,
            _count: {
              select: {
                enrollments: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw createError(404, 'Usuario no encontrado');
    }

    res.json({
      user
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar perfil del usuario
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    if (!name && !email) {
      throw createError(400, 'Debe proporcionar al menos un campo para actualizar');
    }

    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw createError(400, 'Ya existe un usuario con este email');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError(400, 'Contraseña actual y nueva contraseña son requeridas');
    }

    if (newPassword.length < 6) {
      throw createError(400, 'La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true }
    });

    // Verificar contraseña actual
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw createError(400, 'Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};
