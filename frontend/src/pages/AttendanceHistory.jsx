import { useState, useEffect } from 'react';
import { attendanceService, courseService, downloadFile } from '../services/api';
import { Search, Download, Filter, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AttendanceHistory = () => {
  const [attendances, setAttendances] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    courseId: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchAttendances();
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAll({ limit: 100 });
      setCourses(response.courses);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const fetchAttendances = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };
      
      const response = await attendanceService.getAll(params);
      setAttendances(response.attendances);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      courseId: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const blob = await attendanceService.export(params);
      downloadFile(blob, `asistencias_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el archivo');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PRESENTE: 'badge-success',
      AUSENTE: 'badge-danger',
      TARDANZA: 'badge-warning',
      JUSTIFICADO: 'badge-info'
    };
    return badges[status] || 'badge-secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Asistencias</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consulta y exporta el historial completo de asistencias.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary"
          >
            {exporting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-400" />
            <h3 className="text-lg font-medium">Filtros</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="form-label text-sm">
                Curso
              </label>
              <select
                value={filters.courseId}
                onChange={(e) => handleFilterChange('courseId', e.target.value)}
                className="form-input"
              >
                <option value="">Todos los cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} - {course.year} {course.division}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label text-sm">
                Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label text-sm">
                Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label text-sm">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                <option value="">Todos los estados</option>
                <option value="PRESENTE">Presente</option>
                <option value="AUSENTE">Ausente</option>
                <option value="TARDANZA">Tardanza</option>
                <option value="JUSTIFICADO">Justificado</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de asistencias */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay asistencias</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron asistencias con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Fecha</th>
                    <th>Estudiante</th>
                    <th>Curso</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id}>
                      <td>
                        {new Date(attendance.date).toLocaleDateString('es-AR')}
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {attendance.student.firstName} {attendance.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            DNI: {attendance.student.dni}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {attendance.course.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendance.course.year} - Div. {attendance.course.division}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {attendance.notes || '-'}
                        </span>
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
                onClick={() => fetchAttendances(page)}
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

export default AttendanceHistory;
