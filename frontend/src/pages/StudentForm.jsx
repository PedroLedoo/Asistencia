import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { studentService } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      const fetchStudent = async () => {
        try {
          const response = await studentService.getById(id);
          const student = response.student;
          reset({
            dni: student.dni,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email || '',
            phone: student.phone || '',
            address: student.address || '',
            birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : ''
          });
        } catch (error) {
          console.error('Error al cargar estudiante:', error);
          toast.error('Error al cargar el estudiante');
        } finally {
          setLoading(false);
        }
      };

      fetchStudent();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await studentService.update(id, data);
        toast.success('Estudiante actualizado exitosamente');
      } else {
        await studentService.create(data);
        toast.success('Estudiante creado exitosamente');
      }
      navigate('/students');
    } catch (error) {
      console.error('Error al guardar estudiante:', error);
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
        <Link to="/students" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? 'Modifica la información del estudiante' : 'Registra un nuevo estudiante'}
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
                  DNI *
                </label>
                <input
                  {...register('dni', {
                    required: 'El DNI es requerido',
                    minLength: {
                      value: 7,
                      message: 'El DNI debe tener al menos 7 caracteres'
                    },
                    maxLength: {
                      value: 10,
                      message: 'El DNI debe tener máximo 10 caracteres'
                    }
                  })}
                  type="text"
                  className={`form-input ${errors.dni ? 'border-red-300' : ''}`}
                  placeholder="12345678"
                />
                {errors.dni && (
                  <p className="form-error">{errors.dni.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Nombre *
                </label>
                <input
                  {...register('firstName', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  type="text"
                  className={`form-input ${errors.firstName ? 'border-red-300' : ''}`}
                  placeholder="Juan"
                />
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Apellido *
                </label>
                <input
                  {...register('lastName', {
                    required: 'El apellido es requerido',
                    minLength: {
                      value: 2,
                      message: 'El apellido debe tener al menos 2 caracteres'
                    }
                  })}
                  type="text"
                  className={`form-input ${errors.lastName ? 'border-red-300' : ''}`}
                  placeholder="Pérez"
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Email
                </label>
                <input
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="juan.perez@email.com"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Teléfono
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="form-input"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="form-label">
                  Fecha de Nacimiento
                </label>
                <input
                  {...register('birthDate')}
                  type="date"
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Dirección
              </label>
              <textarea
                {...register('address')}
                rows={2}
                className="form-input"
                placeholder="Calle 123, Ciudad, Provincia"
              />
            </div>
          </div>

          <div className="card-footer flex justify-end space-x-3">
            <Link to="/students" className="btn-secondary">
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
                  {isEdit ? 'Actualizar' : 'Crear'} Estudiante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
