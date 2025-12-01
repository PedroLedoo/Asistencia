import express from 'express';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.use(authenticateToken); // Aplicar autenticación a todas las rutas siguientes

// Registro (solo administradores)
router.post('/register', requireAdmin, register);

// Perfil del usuario
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router;
