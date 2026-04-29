import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Doctor, Schedule } from '../../types';
import { DAY_NAMES } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30 });

  const fetchData = async () => {
    const [{ data: doc }, { data: scheds }] = await Promise.all([
      api.get<Doctor>(`/doctors/${id}`),
      api.get<Schedule[]>(`/doctors/${id}/schedules`),
    ]);
    setDoctor(doc);
    setSchedules(scheds);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAdd = async () => {
    try {
      await api.post(`/doctors/${id}/schedules`, form);
      toast.success('Horario agregado');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al agregar horario (verificá que no exista ya)');
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await api.delete(`/doctors/${id}/schedules/${scheduleId}`);
      toast.success('Horario eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Link to="/admin/doctors" className="text-sm text-blue-600 mb-4 block">← Volver a médicos</Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{doctor?.full_name}</h1>
          <p className="text-gray-500">{doctor?.specialty?.name}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Agregar horario</Button>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Horarios de atención</h2>
      {schedules.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay horarios configurados.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Día</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Inicio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fin</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slot</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{DAY_NAMES[s.day_of_week]}</td>
                  <td className="px-4 py-3">{s.start_time.slice(0, 5)}</td>
                  <td className="px-4 py-3">{s.end_time.slice(0, 5)}</td>
                  <td className="px-4 py-3">{s.slot_duration_minutes} min</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar horario">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Día de la semana</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}
            >
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-gray-700">Hora inicio</label>
              <input type="time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-gray-700">Hora fin</label>
              <input type="time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Duración del turno (minutos)</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.slot_duration_minutes}
              onChange={(e) => setForm({ ...form, slot_duration_minutes: Number(e.target.value) })}>
              {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <Button onClick={handleAdd}>Agregar</Button>
        </div>
      </Modal>
    </div>
  );
}
