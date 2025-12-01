import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

// Middleware para verificar JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado o inactivo' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

// Middleware para verificar rol de profesor o administrador
export const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'PROFESOR') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de profesor o administrador.' 
    });
  }
  next();
};

// Middleware para verificar que el profesor solo acceda a sus cursos
export const requireOwnCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id || req.body.courseId || req.query.courseId;
    
    if (!courseId) {
      return res.status(400).json({ 
        error: 'ID del curso requerido' 
      });
    }

    // Los administradores pueden acceder a cualquier curso
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Verificar que el profesor es dueño del curso
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: req.user.id,
        isActive: true
      }
    });

    if (!course) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este curso' 
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error('Error en verificación de curso:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};
