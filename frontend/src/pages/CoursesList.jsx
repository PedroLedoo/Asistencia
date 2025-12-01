import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, Edit, Trash2, Users, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CoursesList = () => {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const response = await courseService.getAll({
        page,
        limit: 10,
        search: search || undefined
      });
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${name}"?`)) {
      try {
        await courseService.delete(id);
        toast.success('Curso eliminado exitosamente');
        fetchCourses();
      } catch (error) {
        console.error('Error al eliminar curso:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona los cursos y materias del centro educativo.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/courses/new"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cursos..."
              className="form-input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron cursos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Curso</th>
                    <th>Año</th>
                    <th>División</th>
                    <th>Profesor</th>
                    <th>Estudiantes</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {course.name}
                          </div>
                          {course.description && (
                            <div className="text-sm text-gray-500">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{course.year}</td>
                      <td>{course.division}</td>
                      <td>{course.teacher.name}</td>
                      <td>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          {course._count.enrollments}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/courses/${course.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/courses/${course.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {isAdmin() && (
                            <button
                              onClick={() => handleDelete(course.id, course.name)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchCourses(page)}
                className={`px-3 py-2 text-sm rounded-md ${
                  page === pagination.page
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default CoursesList;
