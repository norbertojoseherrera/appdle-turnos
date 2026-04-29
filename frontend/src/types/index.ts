export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'patient' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Specialty {
  id: number;
  name: string;
  description: string | null;
}

export interface Doctor {
  id: number;
  full_name: string;
  specialty: Specialty | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Schedule {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  created_at: string;
  doctor_full_name?: string;
  doctor_specialty?: string;
  patient_full_name?: string;
  patient_email?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
