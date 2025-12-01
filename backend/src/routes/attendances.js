import express from 'express';
import { 
  getAttendances, 
  createAttendance, 
  createBulkAttendance,
  updateAttendance, 
  deleteAttendance,
  getStudentAttendances,
  exportAttendances,
  getAttendanceSummary
} from '../controllers/attendanceController.js';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de asistencias
router.get('/', requireTeacher, getAttendances);
router.post('/', requireTeacher, createAttendance);
router.post('/bulk', requireTeacher, createBulkAttendance);
router.put('/:id', requireTeacher, updateAttendance);
router.delete('/:id', requireTeacher, deleteAttendance);

// Asistencias de un estudiante específico
router.get('/student/:id', requireTeacher, getStudentAttendances);

// Exportar asistencias
router.get('/export', requireTeacher, exportAttendances);

// Resumen de asistencias por curso y fecha
router.get('/summary', requireTeacher, getAttendanceSummary);

export default router;
