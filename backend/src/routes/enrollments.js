import express from 'express';
import { 
  getEnrollments, 
  createEnrollment, 
  deleteEnrollment,
  bulkEnrollStudents,
  getAvailableStudents
} from '../controllers/enrollmentController.js';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de inscripciones
router.get('/', requireTeacher, getEnrollments);
router.post('/', requireTeacher, createEnrollment);
router.delete('/:id', requireTeacher, deleteEnrollment);

// Inscripciones en lote
router.post('/bulk', requireTeacher, bulkEnrollStudents);

// Estudiantes disponibles para inscribir
router.get('/available/:courseId', requireTeacher, getAvailableStudents);

export default router;
