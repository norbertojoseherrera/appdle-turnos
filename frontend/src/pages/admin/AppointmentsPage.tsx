import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Appointment } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import StatusBadge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDate) params.append('appt_date', filterDate);
    if (filterStatus) params.append('appt_status', filterStatus);
    try {
      const { data } = await api.get<Appointment[]>(`/appointments?${params}`);
      setAppointments(data);
    } catch {
      toast.error('Error al cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filterDate, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success('Estado actualizado');
      fetchAppointments();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Gestión de Turnos</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="ghost" onClick={() => { setFilterDate(''); setFilterStatus(''); }}>Limpiar</Button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Paciente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Médico</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay turnos</td></tr>
                )}
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3">
                      <div>{a.patient_full_name}</div>
                      <div className="text-xs text-gray-400">{a.patient_email}</div>
                    </td>
                    <td className="px-4 py-3">{a.doctor_full_name}</td>
                    <td className="px-4 py-3">{formatDate(a.appointment_date)}</td>
                    <td className="px-4 py-3">{formatTime(a.start_time)}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {appointments.length === 0 && <p className="text-center text-gray-400 py-8">No hay turnos</p>}
            {appointments.map((a) => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{a.patient_full_name}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-sm text-gray-500">{a.doctor_full_name}</p>
                <p className="text-sm text-gray-500">{formatDate(a.appointment_date)} — {formatTime(a.start_time)}</p>
                <select
                  value={a.status}
                  onChange={(e) => updateStatus(a.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
