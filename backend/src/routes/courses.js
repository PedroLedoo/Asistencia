import express from 'express';
import { 
  getCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCourseStats
} from '../controllers/courseController.js';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de cursos
router.get('/', requireTeacher, getCourses);
router.get('/:id', requireTeacher, getCourseById);
router.post('/', requireTeacher, createCourse);
router.put('/:id', requireTeacher, updateCourse);
router.delete('/:id', requireTeacher, deleteCourse);

// Estadísticas del curso
router.get('/:id/stats', requireTeacher, getCourseStats);

export default router;
