import type { AppointmentStatus } from '../types';

const styles: Record<AppointmentStatus, string> = {
  Scheduled:  'bg-blue-50 text-blue-700 border border-blue-200',
  InProgress: 'bg-amber-50 text-amber-700 border border-amber-200',
  Completed:  'bg-green-50 text-green-700 border border-green-200',
  NoShow:     'bg-red-50 text-red-600 border border-red-200',
};

const labels: Record<AppointmentStatus, string> = {
  Scheduled:  'Scheduled',
  InProgress: 'In Progress',
  Completed:  'Completed',
  NoShow:     'No Show',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
