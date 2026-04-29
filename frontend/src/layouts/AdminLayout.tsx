import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/appointments', label: 'Turnos' },
  { to: '/admin/doctors', label: 'Médicos' },
  { to: '/admin/specialties', label: 'Especialidades' },
  { to: '/admin/patients', label: 'Pacientes' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col p-4 shrink-0">
        <Link to="/admin" className="text-lg font-bold text-blue-600 mb-1">Appdle Admin</Link>
        <p className="text-xs text-gray-400 mb-6">Panel de administración</p>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs text-gray-500 truncate">{user?.full_name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 mt-1">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
