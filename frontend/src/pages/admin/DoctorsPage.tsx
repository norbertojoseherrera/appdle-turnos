import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import type { Doctor, Specialty } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  full_name: z.string().min(2),
  specialty_id: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchData = async () => {
    const [{ data: docs }, { data: specs }] = await Promise.all([
      api.get<Doctor[]>('/doctors'),
      api.get<Specialty[]>('/specialties'),
    ]);
    setDoctors(docs);
    setSpecialties(specs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    reset({
      full_name: doc.full_name,
      specialty_id: doc.specialty?.id?.toString() ?? '',
      bio: doc.bio ?? '',
      phone: doc.phone ?? '',
      email: doc.email ?? '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      specialty_id: data.specialty_id ? Number(data.specialty_id) : undefined,
    };
    try {
      if (editing) {
        await api.put(`/doctors/${editing.id}`, payload);
        toast.success('Médico actualizado');
      } else {
        await api.post('/doctors', payload);
        toast.success('Médico creado');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const toggleActive = async (doc: Doctor) => {
    try {
      await api.put(`/doctors/${doc.id}`, { is_active: !doc.is_active });
      toast.success(doc.is_active ? 'Médico desactivado' : 'Médico activado');
      fetchData();
    } catch {
      toast.error('Error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
        <Button onClick={openCreate}>Agregar médico</Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Especialidad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doctors.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3 font-medium">{doc.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{doc.specialty?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${doc.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {doc.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(doc)}>Editar</Button>
                  <Link to={`/admin/doctors/${doc.id}`}><Button size="sm" variant="secondary">Horarios</Button></Link>
                  <Button size="sm" variant={doc.is_active ? 'danger' : 'primary'} onClick={() => toggleActive(doc)}>
                    {doc.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar médico' : 'Nuevo médico'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nombre completo" error={errors.full_name?.message} {...register('full_name')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Especialidad</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('specialty_id')}>
              <option value="">Sin especialidad</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input label="Bio" {...register('bio')} />
          <Input label="Teléfono" {...register('phone')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" loading={isSubmitting}>{editing ? 'Guardar cambios' : 'Crear médico'}</Button>
        </form>
      </Modal>
    </div>
  );
}
