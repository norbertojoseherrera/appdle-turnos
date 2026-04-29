import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../lib/api';
import type { Appointment } from '../../types';
import { formatTime } from '../../lib/utils';
import StatusBadge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [totalAppts, setTotalAppts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    Promise.all([
      api.get<Appointment[]>(`/appointments?appt_date=${today}`),
      api.get<Appointment[]>('/appointments'),
    ]).then(([todayRes, allRes]) => {
      setTodayAppts(todayRes.data);
      setTotalAppts(allRes.data.length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Turnos hoy</p>
          <p className="text-3xl font-bold text-blue-600">{todayAppts.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total de turnos</p>
          <p className="text-3xl font-bold text-gray-900">{totalAppts}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Turnos de hoy</h2>
      {todayAppts.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay turnos para hoy.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Paciente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Médico</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Horario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todayAppts.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">{a.patient_full_name}</td>
                  <td className="px-4 py-3">{a.doctor_full_name}</td>
                  <td className="px-4 py-3">{formatTime(a.start_time)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
