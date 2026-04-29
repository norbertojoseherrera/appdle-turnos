import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Doctor, Specialty, TimeSlot } from '../../types';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

type Step = 1 | 2 | 3 | 4;

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Specialty[]>('/specialties').then(({ data }) => setSpecialties(data));
  }, []);

  useEffect(() => {
    if (!selectedSpecialty) return;
    setLoading(true);
    api.get<Doctor[]>(`/doctors?specialty_id=${selectedSpecialty.id}`)
      .then(({ data }) => setDoctors(data))
      .finally(() => setLoading(false));
  }, [selectedSpecialty]);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    api.get<TimeSlot[]>(`/doctors/${selectedDoctor.id}/available-slots?date=${dateStr}`)
      .then(({ data }) => setSlots(data))
      .finally(() => setLoading(false));
  }, [selectedDoctor, selectedDate]);

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        doctor_id: selectedDoctor.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot.start_time,
        reason: reason || null,
      });
      toast.success('¡Turno reservado exitosamente!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Error al reservar el turno');
    } finally {
      setSubmitting(false);
    }
  };

  const isWeekday = (date: Date) => date.getDay() !== 0 && date.getDay() !== 6;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservar turno</h1>

      {/* Indicador de pasos */}
      <div className="flex gap-2 mb-6">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* Paso 1: Especialidad */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Elegí una especialidad</h2>
          <div className="grid grid-cols-2 gap-3">
            {specialties.map((sp) => (
              <button
                key={sp.id}
                onClick={() => { setSelectedSpecialty(sp); setStep(2); }}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <p className="font-medium text-gray-900">{sp.name}</p>
                {sp.description && <p className="text-sm text-gray-500 mt-1">{sp.description}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: Médico */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="text-sm text-blue-600 mb-4">← Volver</button>
          <h2 className="text-lg font-semibold mb-4">Elegí un médico de {selectedSpecialty?.name}</h2>
          {loading ? <Spinner /> : (
            <div className="space-y-3">
              {doctors.length === 0 && <p className="text-gray-400">No hay médicos disponibles para esta especialidad.</p>}
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                  className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <p className="font-medium text-gray-900">{doc.full_name}</p>
                  {doc.bio && <p className="text-sm text-gray-500 mt-1">{doc.bio}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paso 3: Fecha y horario */}
      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="text-sm text-blue-600 mb-4">← Volver</button>
          <h2 className="text-lg font-semibold mb-4">Elegí fecha y horario con {selectedDoctor?.full_name}</h2>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Fecha</p>
            <DatePicker
              selected={selectedDate}
              onChange={(d: Date | null) => { setSelectedDate(d); setSelectedSlot(null); }}
              minDate={new Date()}
              filterDate={isWeekday}
              inline
              className="border rounded-lg"
            />
          </div>
          {selectedDate && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Horarios disponibles</p>
              {loading ? <Spinner /> : slots.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay horarios disponibles para este día.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.start_time}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                        selectedSlot?.start_time === slot.start_time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {slot.start_time}
                    </button>
                  ))}
                </div>
              )}
              {selectedSlot && (
                <Button className="mt-4" onClick={() => setStep(4)}>Continuar</Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Paso 4: Confirmación */}
      {step === 4 && (
        <div>
          <button onClick={() => setStep(3)} className="text-sm text-blue-600 mb-4">← Volver</button>
          <h2 className="text-lg font-semibold mb-4">Confirmar turno</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 mb-4">
            <div><span className="text-sm text-gray-500">Especialidad:</span> <span className="font-medium">{selectedSpecialty?.name}</span></div>
            <div><span className="text-sm text-gray-500">Médico:</span> <span className="font-medium">{selectedDoctor?.full_name}</span></div>
            <div><span className="text-sm text-gray-500">Fecha:</span> <span className="font-medium">{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</span></div>
            <div><span className="text-sm text-gray-500">Horario:</span> <span className="font-medium">{selectedSlot?.start_time} - {selectedSlot?.end_time}</span></div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-1">Motivo de la consulta (opcional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describí brevemente el motivo..."
            />
          </div>
          <Button loading={submitting} size="lg" onClick={handleConfirm}>Confirmar reserva</Button>
        </div>
      )}
    </div>
  );
}
