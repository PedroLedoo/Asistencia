import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { ArrowLeft, Users, Calendar, Edit } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseService.getById(id);
        setCourse(response.course);
      } catch (error) {
        console.error('Error al cargar curso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Curso no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/courses" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-sm text-gray-500">
              {course.year} - División {course.division}
            </p>
          </div>
        </div>
        <Link to={`/courses/${course.id}/edit`} className="btn-primary">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Link>
      </div>

      {/* Información del curso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Información del Curso</h3>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Año</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">División</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.division}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Profesor</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.teacher.name}</dd>
                </div>
                {course.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                    <dd className="mt-1 text-sm text-gray-900">{course.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Estadísticas</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Estudiantes</span>
                  </div>
                  <span className="text-lg font-semibold">{course._count.enrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Asistencias</span>
                  </div>
                  <span className="text-lg font-semibold">{course._count.attendances}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estudiantes inscriptos */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Estudiantes Inscriptos</h3>
        </div>
        <div className="card-body">
          {course.enrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay estudiantes inscriptos en este curso.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>DNI</th>
                    <th>Nombre</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {course.enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.student.dni}</td>
                      <td>
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </td>
                      <td>{enrollment.student.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
