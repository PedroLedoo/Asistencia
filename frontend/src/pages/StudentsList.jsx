import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentsList = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const response = await studentService.getAll({
        page,
        limit: 10,
        search: search || undefined
      });
      setStudents(response.students);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al estudiante "${name}"?`)) {
      try {
        await studentService.delete(id);
        toast.success('Estudiante eliminado exitosamente');
        fetchStudents();
      } catch (error) {
        console.error('Error al eliminar estudiante:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudiantes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona los estudiantes del centro educativo.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/students/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Estudiante
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
              placeholder="Buscar estudiantes por DNI, nombre o email..."
              className="form-input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron estudiantes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>DNI</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Cursos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="font-mono">{student.dni}</td>
                      <td>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td>{student.email || '-'}</td>
                      <td>{student.phone || '-'}</td>
                      <td>
                        <span className="badge-info">
                          {student.enrollments.length} curso{student.enrollments.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/students/${student.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/students/${student.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {isAdmin() && (
                            <button
                              onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
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
                onClick={() => fetchStudents(page)}
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

export default StudentsList;
