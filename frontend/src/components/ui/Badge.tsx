import { STATUS_COLORS, STATUS_LABELS } from '../../lib/utils';
import type { AppointmentStatus } from '../../types';

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
