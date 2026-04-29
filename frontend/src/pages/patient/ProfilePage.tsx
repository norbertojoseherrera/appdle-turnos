import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: user?.full_name ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.put('/auth/me', data);
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al actualizar el perfil');
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi perfil</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nombre completo" error={errors.full_name?.message} {...register('full_name')} />
          <Input label="Teléfono" {...register('phone')} />
          <Button type="submit" loading={isSubmitting}>Guardar cambios</Button>
        </form>
      </div>
    </div>
  );
}
