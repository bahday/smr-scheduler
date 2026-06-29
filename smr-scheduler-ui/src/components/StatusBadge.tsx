import type { AppointmentStatus } from '../types';

const colours: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  InProgress: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  NoShow: 'bg-red-100 text-red-800',
};

const labels: Record<AppointmentStatus, string> = {
  Scheduled: 'Scheduled',
  InProgress: 'In Progress',
  Completed: 'Completed',
  NoShow: 'No Show',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colours[status]}`}>
      {labels[status]}
    </span>
  );
}
