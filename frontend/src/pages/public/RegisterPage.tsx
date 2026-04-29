import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Error al registrarse');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Nombre completo" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Contraseña" type="password" error={errors.password?.message} {...register('password')} />
        <Input label="Teléfono (opcional)" {...register('phone')} />
        <Button type="submit" loading={isSubmitting} size="lg" className="w-full">Registrarse</Button>
      </form>
      <p className="text-sm text-center text-gray-500 mt-4">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">Iniciar sesión</Link>
      </p>
    </div>
  );
}
