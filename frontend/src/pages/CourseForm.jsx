import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { courseService } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      const fetchCourse = async () => {
        try {
          const response = await courseService.getById(id);
          const course = response.course;
          reset({
            name: course.name,
            description: course.description || '',
            year: course.year,
            division: course.division
          });
        } catch (error) {
          console.error('Error al cargar curso:', error);
          toast.error('Error al cargar el curso');
        } finally {
          setLoading(false);
        }
      };

      fetchCourse();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await courseService.update(id, data);
        toast.success('Curso actualizado exitosamente');
      } else {
        await courseService.create(data);
        toast.success('Curso creado exitosamente');
      }
      navigate('/courses');
    } catch (error) {
      console.error('Error al guardar curso:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/courses" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Curso' : 'Nuevo Curso'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? 'Modifica la información del curso' : 'Crea un nuevo curso'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label">
                  Nombre del Curso *
                </label>
                <input
                  {...register('name', {
                    required: 'El nombre del curso es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  type="text"
                  className={`form-input ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Ej: Programación Web"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  División *
                </label>
                <input
                  {...register('division', {
                    required: 'La división es requerida'
                  })}
                  type="text"
                  className={`form-input ${errors.division ? 'border-red-300' : ''}`}
                  placeholder="Ej: A, B, C"
                />
                {errors.division && (
                  <p className="form-error">{errors.division.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Año *
                </label>
                <select
                  {...register('year', {
                    required: 'El año es requerido',
                    valueAsNumber: true
                  })}
                  className={`form-input ${errors.year ? 'border-red-300' : ''}`}
                >
                  <option value="">Seleccionar año</option>
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && (
                  <p className="form-error">{errors.year.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="form-input"
                placeholder="Descripción opcional del curso"
              />
            </div>
          </div>

          <div className="card-footer flex justify-end space-x-3">
            <Link
              to="/courses"
              className="btn-secondary"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Actualizar' : 'Crear'} Curso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;
