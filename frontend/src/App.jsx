import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';

// Componentes
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CoursesList from './pages/CoursesList';
import CourseDetail from './pages/CourseDetail';
import CourseForm from './pages/CourseForm';
import StudentsList from './pages/StudentsList';
import StudentDetail from './pages/StudentDetail';
import StudentForm from './pages/StudentForm';
import AttendanceForm from './pages/AttendanceForm';
import AttendanceHistory from './pages/AttendanceHistory';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Perfil */}
              <Route path="profile" element={<Profile />} />
              
              {/* Cursos */}
              <Route path="courses" element={<CoursesList />} />
              <Route path="courses/new" element={<CourseForm />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="courses/:id/edit" element={<CourseForm />} />
              
              {/* Estudiantes */}
              <Route path="students" element={<StudentsList />} />
              <Route path="students/new" element={<StudentForm />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="students/:id/edit" element={<StudentForm />} />
              
              {/* Asistencias */}
              <Route path="attendance" element={<AttendanceForm />} />
              <Route path="attendance/history" element={<AttendanceHistory />} />
            </Route>
            
            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* Notificaciones toast */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
