import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Cursos', href: '/courses', icon: BookOpen },
    { name: 'Estudiantes', href: '/students', icon: Users },
    { name: 'Asistencias', href: '/attendance', icon: ClipboardCheck },
    { name: 'Historial', href: '/attendance/history', icon: BarChart3 },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <SidebarContent navigation={navigation} isActive={isActive} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} isActive={isActive} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header móvil */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Área de contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Componente del contenido del sidebar
const SidebarContent = ({ navigation, isActive, user, onLogout }) => (
  <div className="flex flex-col h-full bg-white border-r border-gray-200">
    {/* Logo */}
    <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
      <GraduationCap className="h-8 w-8 text-white" />
      <div className="ml-3">
        <h1 className="text-white font-semibold text-lg">CPFP N°6</h1>
        <p className="text-primary-100 text-xs">Sistema de Asistencias</p>
      </div>
    </div>

    {/* Navegación */}
    <div className="flex-1 flex flex-col overflow-y-auto">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link-inactive'}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Información del usuario */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <Link
            to="/profile"
            className="flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <User className="mr-3 h-4 w-4" />
            Mi Perfil
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Layout;
