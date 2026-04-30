import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Mis turnos' },
  { to: '/appointments/new', label: 'Reservar turno' },
  { to: '/profile', label: 'Mi perfil' },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setMenuOpen(false)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === item.to
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Mobile header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-bold text-blue-600">Appdle Turnos</Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-1">
          <NavLinks />
          <div className="border-t border-gray-200 pt-3 mt-2">
            <p className="text-xs text-gray-500">{user?.full_name}</p>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 mt-1">Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col p-4 shrink-0">
        <Link to="/dashboard" className="text-lg font-bold text-blue-600 mb-6">Appdle Turnos</Link>
        <nav className="flex flex-col gap-1 flex-1"><NavLinks /></nav>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs text-gray-500 truncate">{user?.full_name}</p>
          <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 mt-1">Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
