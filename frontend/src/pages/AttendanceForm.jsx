import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { courseService, attendanceService } from '../services/api';
import { Calendar, Users, Save, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AttendanceForm = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendances, setAttendances] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  });

  const watchedCourseId = watch('courseId');
  const watchedDate = watch('date');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (watchedCourseId) {
      fetchCourseDetails(watchedCourseId);
    }
  }, [watchedCourseId]);

  useEffect(() => {
    if (selectedCourse && watchedDate) {
      checkExistingAttendances();
    }
  }, [selectedCourse, watchedDate]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAll({ limit: 100 });
      setCourses(response.courses);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      const response = await courseService.getById(courseId);
      setSelectedCourse(response.course);
      
      // Inicializar asistencias con estado por defecto
      const initialAttendances = {};
      response.course.enrollments.forEach(enrollment => {
        initialAttendances[enrollment.student.id] = {
          status: 'PRESENTE',
          notes: ''
        };
      });
      setAttendances(initialAttendances);
    } catch (error) {
      console.error('Error al cargar detalles del curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAttendances = async () => {
    try {
      const response = await attendanceService.getSummary({
        courseId: selectedCourse.id,
        date: watchedDate
      });
      
      if (response.summary.some(s => s.attendance)) {
        toast.error('Ya existen asistencias registradas para esta fecha');
      }
    } catch (error) {
      // No hacer nada si no se pueden cargar las asistencias existentes
    }
  };

  const updateAttendance = (studentId, field, value) => {
    setAttendances(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const setAllAttendances = (status) => {
    const updatedAttendances = {};
    Object.keys(attendances).forEach(studentId => {
      updatedAttendances[studentId] = {
        ...attendances[studentId],
        status
      };
    });
    setAttendances(updatedAttendances);
  };

  const onSubmit = async (data) => {
    if (!selectedCourse) {
      toast.error('Selecciona un curso');
      return;
    }

    try {
      setSubmitting(true);
      
      const attendanceData = {
        courseId: data.courseId,
        date: new Date(data.date + 'T12:00:00.000Z').toISOString(),
        attendances: Object.entries(attendances).map(([studentId, attendance]) => ({
          studentId,
          status: attendance.status,
          notes: attendance.notes || undefined
        }))
      };

      await attendanceService.createBulk(attendanceData);
      toast.success('Asistencias registradas exitosamente');
      
      // Limpiar formulario
      setSelectedCourse(null);
      setAttendances({});
      
    } catch (error) {
      console.error('Error al registrar asistencias:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PRESENTE: CheckCircle,
      AUSENTE: XCircle,
      TARDANZA: Clock,
      JUSTIFICADO: AlertCircle
    };
    return icons[status] || CheckCircle;
  };

  const getStatusColor = (status) => {
    const colors = {
      PRESENTE: 'text-green-600',
      AUSENTE: 'text-red-600',
      TARDANZA: 'text-yellow-600',
      JUSTIFICADO: 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tomar Asistencia</h1>
        <p className="mt-2 text-sm text-gray-700">
          Registra la asistencia de los estudiantes para un curso y fecha específicos.
        </p>
      </div>

      {/* Formulario de selección */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Fecha *
                </label>
                <input
                  {...register('date', {
                    required: 'La fecha es requerida'
                  })}
                  type="date"
                  className={`form-input ${errors.date ? 'border-red-300' : ''}`}
                />
                {errors.date && (
                  <p className="form-error">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  <Users className="h-4 w-4 inline mr-2" />
                  Curso *
                </label>
                <select
                  {...register('courseId', {
                    required: 'El curso es requerido'
                  })}
                  className={`form-input ${errors.courseId ? 'border-red-300' : ''}`}
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.year} {course.division}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="form-error">{errors.courseId.message}</p>
                )}
              </div>
            </div>

            {/* Lista de estudiantes */}
            {selectedCourse && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Estudiantes ({selectedCourse.enrollments.length})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setAllAttendances('PRESENTE')}
                      className="btn-sm btn-success"
                    >
                      Todos Presentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllAttendances('AUSENTE')}
                      className="btn-sm btn-danger"
                    >
                      Todos Ausentes
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCourse.enrollments.map((enrollment) => {
                      const student = enrollment.student;
                      const attendance = attendances[student.id] || { status: 'PRESENTE', notes: '' };
                      const StatusIcon = getStatusIcon(attendance.status);
                      
                      return (
                        <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className={`h-5 w-5 ${getStatusColor(attendance.status)}`} />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </h4>
                                <p className="text-sm text-gray-500">DNI: {student.dni}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="form-label text-xs">
                                Estado
                              </label>
                              <select
                                value={attendance.status}
                                onChange={(e) => updateAttendance(student.id, 'status', e.target.value)}
                                className="form-input text-sm"
                              >
                                <option value="PRESENTE">Presente</option>
                                <option value="AUSENTE">Ausente</option>
                                <option value="TARDANZA">Tardanza</option>
                                <option value="JUSTIFICADO">Justificado</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="form-label text-xs">
                                Observaciones
                              </label>
                              <input
                                type="text"
                                value={attendance.notes}
                                onChange={(e) => updateAttendance(student.id, 'notes', e.target.value)}
                                className="form-input text-sm"
                                placeholder="Observaciones opcionales"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Botón de envío */}
            {selectedCourse && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary btn-lg"
                >
                  {submitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Registrar Asistencias
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
