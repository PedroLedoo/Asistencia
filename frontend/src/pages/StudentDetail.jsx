import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentService } from '../services/api';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await studentService.getById(id);
        setStudent(response.student);
      } catch (error) {
        console.error('Error al cargar estudiante:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Estudiante no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/students" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-gray-500">DNI: {student.dni}</p>
          </div>
        </div>
        <Link to={`/students/${student.id}/edit`} className="btn-primary">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Link>
      </div>

      {/* Información del estudiante */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Información Personal</h3>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">DNI</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{student.dni}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.firstName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Apellido</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.lastName}</dd>
                </div>
                {student.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      {student.email}
                    </dd>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {student.phone}
                    </dd>
                  </div>
                )}
                {student.address && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {student.address}
                    </dd>
                  </div>
                )}
                {student.birthDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(student.birthDate).toLocaleDateString('es-AR')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Cursos Inscriptos</h3>
            </div>
            <div className="card-body">
              {student.enrollments.length === 0 ? (
                <p className="text-gray-500 text-sm">No está inscripto en ningún curso.</p>
              ) : (
                <div className="space-y-3">
                  {student.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900">
                        {enrollment.course.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {enrollment.course.year} - División {enrollment.course.division}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de asistencias recientes */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Asistencias Recientes</h3>
        </div>
        <div className="card-body">
          {student.attendances.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay asistencias registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Fecha</th>
                    <th>Curso</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {student.attendances.slice(0, 10).map((attendance) => (
                    <tr key={attendance.id}>
                      <td>{new Date(attendance.date).toLocaleDateString('es-AR')}</td>
                      <td>
                        {attendance.course.name} - {attendance.course.year} {attendance.course.division}
                      </td>
                      <td>
                        <span className={`badge ${
                          attendance.status === 'PRESENTE' ? 'badge-success' :
                          attendance.status === 'AUSENTE' ? 'badge-danger' :
                          attendance.status === 'TARDANZA' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td>{attendance.notes || '-'}</td>
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

export default StudentDetail;
