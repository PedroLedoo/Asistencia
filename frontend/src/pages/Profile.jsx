import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { User, Mail, Key, Save } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
    watch
  } = useForm();

  const watchNewPassword = watch('newPassword');

  const onSubmitProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      updateUser(response.user);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Contraseña cambiada exitosamente');
      resetPassword();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Información Personal', icon: User },
    { id: 'password', name: 'Cambiar Contraseña', icon: Key }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-2 text-sm text-gray-700">
          Gestiona tu información personal y configuración de cuenta.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las tabs */}
      <div className="card">
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <div className="card-header">
              <h3 className="text-lg font-medium flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información Personal
              </h3>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">
                    Nombre Completo *
                  </label>
                  <input
                    {...registerProfile('name', {
                      required: 'El nombre es requerido',
                      minLength: {
                        value: 2,
                        message: 'El nombre debe tener al menos 2 caracteres'
                      }
                    })}
                    type="text"
                    className={`form-input ${errorsProfile.name ? 'border-red-300' : ''}`}
                  />
                  {errorsProfile.name && (
                    <p className="form-error">{errorsProfile.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Correo Electrónico *
                  </label>
                  <input
                    {...registerProfile('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    type="email"
                    className={`form-input ${errorsProfile.email ? 'border-red-300' : ''}`}
                  />
                  {errorsProfile.email && (
                    <p className="form-error">{errorsProfile.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="form-label">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="form-input bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Fecha de Registro
                  </label>
                  <input
                    type="text"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : ''}
                    disabled
                    className="form-input bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
            <div className="card-footer flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingProfile}
                className="btn-primary"
              >
                {isSubmittingProfile ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <div className="card-header">
              <h3 className="text-lg font-medium flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Cambiar Contraseña
              </h3>
            </div>
            <div className="card-body space-y-6">
              <div className="max-w-md space-y-4">
                <div>
                  <label className="form-label">
                    Contraseña Actual *
                  </label>
                  <input
                    {...registerPassword('currentPassword', {
                      required: 'La contraseña actual es requerida'
                    })}
                    type="password"
                    className={`form-input ${errorsPassword.currentPassword ? 'border-red-300' : ''}`}
                    placeholder="••••••••"
                  />
                  {errorsPassword.currentPassword && (
                    <p className="form-error">{errorsPassword.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Nueva Contraseña *
                  </label>
                  <input
                    {...registerPassword('newPassword', {
                      required: 'La nueva contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres'
                      }
                    })}
                    type="password"
                    className={`form-input ${errorsPassword.newPassword ? 'border-red-300' : ''}`}
                    placeholder="••••••••"
                  />
                  {errorsPassword.newPassword && (
                    <p className="form-error">{errorsPassword.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    {...registerPassword('confirmPassword', {
                      required: 'Confirma la nueva contraseña',
                      validate: value => value === watchNewPassword || 'Las contraseñas no coinciden'
                    })}
                    type="password"
                    className={`form-input ${errorsPassword.confirmPassword ? 'border-red-300' : ''}`}
                    placeholder="••••••••"
                  />
                  {errorsPassword.confirmPassword && (
                    <p className="form-error">{errorsPassword.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Consejos para una contraseña segura:
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Usa al menos 6 caracteres</li>
                        <li>Combina letras, números y símbolos</li>
                        <li>Evita información personal obvia</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="btn-primary"
              >
                {isSubmittingPassword ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
