import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { courseService, studentService, attendanceService } from '../services/api';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  Calendar,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    attendances: 0,
    recentAttendances: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener estadísticas básicas
        const [coursesRes, studentsRes, attendancesRes] = await Promise.all([
          courseService.getAll({ limit: 1 }),
          studentService.getAll({ limit: 1 }),
          attendanceService.getAll({ limit: 10 })
        ]);

        setStats({
          courses: coursesRes.pagination.total,
          students: studentsRes.pagination.total,
          attendances: attendancesRes.pagination.total,
          recentAttendances: attendancesRes.attendances
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      PRESENTE: 'badge-success',
      AUSENTE: 'badge-danger',
      TARDANZA: 'badge-warning',
      JUSTIFICADO: 'badge-info'
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PRESENTE: UserCheck,
      AUSENTE: UserX,
      TARDANZA: Clock,
      JUSTIFICADO: ClipboardCheck
    };
    const Icon = icons[status] || ClipboardCheck;
    return <Icon className="h-4 w-4" />;
  };

  const quickActions = [
    {
      title: 'Tomar Asistencia',
      description: 'Registrar asistencia de estudiantes',
      href: '/attendance',
      icon: ClipboardCheck,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Ver Cursos',
      description: 'Gestionar cursos y materias',
      href: '/courses',
      icon: BookOpen,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Ver Estudiantes',
      description: 'Gestionar estudiantes',
      href: '/students',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Historial',
      description: 'Ver historial de asistencias',
      href: '/attendance/history',
      icon: TrendingUp,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Aquí tienes un resumen de la actividad reciente del sistema.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Cursos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.courses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Estudiantes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.students}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Asistencias
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.attendances}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hoy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Date().toLocaleDateString('es-AR')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 text-white ${action.color}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Asistencias recientes */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Asistencias Recientes</h3>
        </div>
        <div className="card-body">
          {stats.recentAttendances.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay asistencias registradas recientemente.
            </p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {stats.recentAttendances.map((attendance, idx) => (
                  <li key={attendance.id}>
                    <div className="relative pb-8">
                      {idx !== stats.recentAttendances.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          attendance.status === 'PRESENTE' ? 'bg-green-100' :
                          attendance.status === 'AUSENTE' ? 'bg-red-100' :
                          attendance.status === 'TARDANZA' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {getStatusIcon(attendance.status)}
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">
                                {attendance.student.firstName} {attendance.student.lastName}
                              </span>
                              {' '}en{' '}
                              <span className="font-medium">
                                {attendance.course.name}
                              </span>
                            </p>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className={`badge ${getStatusBadge(attendance.status)}`}>
                                {attendance.status}
                              </span>
                              {attendance.notes && (
                                <span className="text-xs text-gray-500">
                                  {attendance.notes}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(attendance.date).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {stats.recentAttendances.length > 0 && (
          <div className="card-footer">
            <Link
              to="/attendance/history"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Ver todo el historial →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
