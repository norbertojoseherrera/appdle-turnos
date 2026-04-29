import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Appointment } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import StatusBadge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function PatientDashboard() {
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const [{ data: up }, { data: pa }] = await Promise.all([
        api.get('/appointments/mine?upcoming=true'),
        api.get('/appointments/mine?upcoming=false'),
      ]);
      setUpcoming(up);
      setPast(pa);
    } catch {
      toast.error('Error al cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar este turno?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Turno cancelado');
      fetchAppointments();
    } catch {
      toast.error('No se pudo cancelar el turno');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis turnos</h1>
        <Link to="/appointments/new">
          <Button>Reservar turno</Button>
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Próximos turnos</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm">No tenés turnos próximos.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{a.doctor_full_name}</p>
                  <p className="text-sm text-gray-500">{a.doctor_specialty}</p>
                  <p className="text-sm text-gray-500">{formatDate(a.appointment_date)} — {formatTime(a.start_time)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <Button variant="danger" size="sm" onClick={() => handleCancel(a.id)}>Cancelar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Historial</h2>
        {past.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay turnos anteriores.</p>
        ) : (
          <div className="space-y-3">
            {past.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-75">
                <div>
                  <p className="font-medium text-gray-700">{a.doctor_full_name}</p>
                  <p className="text-sm text-gray-400">{a.doctor_specialty}</p>
                  <p className="text-sm text-gray-400">{formatDate(a.appointment_date)} — {formatTime(a.start_time)}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
