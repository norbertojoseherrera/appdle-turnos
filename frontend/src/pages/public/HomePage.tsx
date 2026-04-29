import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Reservá tu turno médico</h1>
      <p className="text-xl text-gray-500 mb-8">Elegí tu especialista y encontrá el horario que más te convenga.</p>
      <div className="flex gap-4 justify-center">
        <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
          Crear cuenta
        </Link>
        <Link to="/login" className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
