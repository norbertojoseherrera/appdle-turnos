import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    return null;
  }

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      // AuthContext loads user async; navigate after brief tick
      setTimeout(() => navigate('/dashboard'), 100);
    } catch {
      toast.error('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Iniciar sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Contraseña" type="password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" loading={isSubmitting} size="lg" className="w-full">Ingresar</Button>
      </form>
      <p className="text-sm text-center text-gray-500 mt-4">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">Registrarse</Link>
      </p>
    </div>
  );
}
