import express from 'express';
import { 
  getStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentStats
} from '../controllers/studentController.js';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de estudiantes
router.get('/', requireTeacher, getStudents);
router.get('/:id', requireTeacher, getStudentById);
router.post('/', requireTeacher, createStudent);
router.put('/:id', requireTeacher, updateStudent);
router.delete('/:id', requireTeacher, deleteStudent);

// Estadísticas del estudiante
router.get('/:id/stats', requireTeacher, getStudentStats);

export default router;
