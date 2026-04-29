import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { User } from '../../types';
import { formatDate } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function PatientsPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    const { data } = await api.get<User[]>('/admin/users');
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const toggleActive = async (user: User) => {
    try {
      await api.put(`/admin/users/${user.id}/activate`);
      toast.success(user.is_active ? 'Paciente desactivado' : 'Paciente activado');
      fetchPatients();
    } catch {
      toast.error('Error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pacientes</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Registrado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patients.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay pacientes registrados</td></tr>
            )}
            {patients.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.full_name}</td>
                <td className="px-4 py-3">{p.email}</td>
                <td className="px-4 py-3">{p.phone ?? '—'}</td>
                <td className="px-4 py-3">{formatDate(p.created_at.split('T')[0])}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${p.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant={p.is_active ? 'danger' : 'primary'} onClick={() => toggleActive(p)}>
                    {p.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
