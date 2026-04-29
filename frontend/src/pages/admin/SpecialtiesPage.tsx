import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import type { Specialty } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetchSpecialties = async () => {
    const { data } = await api.get<Specialty[]>('/specialties');
    setSpecialties(data);
    setLoading(false);
  };

  useEffect(() => { fetchSpecialties(); }, []);

  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (sp: Specialty) => { setEditing(sp); reset({ name: sp.name, description: sp.description ?? '' }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await api.put(`/specialties/${editing.id}`, data);
        toast.success('Especialidad actualizada');
      } else {
        await api.post('/specialties', data);
        toast.success('Especialidad creada');
      }
      setModalOpen(false);
      fetchSpecialties();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar especialidad?')) return;
    try {
      await api.delete(`/specialties/${id}`);
      toast.success('Especialidad eliminada');
      fetchSpecialties();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Especialidades</h1>
        <Button onClick={openCreate}>Agregar especialidad</Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {specialties.map((sp) => (
              <tr key={sp.id}>
                <td className="px-4 py-3 font-medium">{sp.name}</td>
                <td className="px-4 py-3 text-gray-500">{sp.description ?? '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(sp)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(sp.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar especialidad' : 'Nueva especialidad'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nombre" error={errors.name?.message} {...register('name')} />
          <Input label="Descripción" {...register('description')} />
          <Button type="submit" loading={isSubmitting}>{editing ? 'Guardar cambios' : 'Crear'}</Button>
        </form>
      </Modal>
    </div>
  );
}
