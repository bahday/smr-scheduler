import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { useActingAs } from '../context/ActingAsContext';
import type { AppointmentSummary, ScheduleGroup } from '../types';

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Dublin',
  });
}

function AppointmentRow({ appt }: { appt: AppointmentSummary }) {
  return (
    <Link
      to={`/appointments/${appt.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
    >
      <span className="w-16 text-sm font-mono text-gray-500 shrink-0">
        {formatTime(appt.startUtc)}
      </span>
      <span className="w-32 text-xs font-mono text-gray-400 shrink-0">
        {appt.referenceNumber}
      </span>
      <span className="flex-1 font-medium text-gray-800 text-sm">
        {appt.customerName}
      </span>
      <span className="text-sm text-gray-500 w-28 shrink-0">
        {appt.vehicleRegistration}
      </span>
      <span className="text-sm text-gray-600 w-28 shrink-0">
        {appt.serviceType}
      </span>
      <StatusBadge status={appt.status} />
    </Link>
  );
}

function AdminView() {
  const [groups, setGroups] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTodaySchedule()
      .then(setGroups)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading schedule…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (groups.length === 0)
    return <p className="text-gray-500">No appointments booked for today.</p>;

  return (
    <div className="space-y-6">
      {groups.map(g => (
        <div key={g.mechanicId} className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 bg-gray-50 border-b rounded-t-lg flex items-center gap-3">
            <div>
              <p className="font-semibold text-gray-800">{g.mechanicName}</p>
              <p className="text-xs text-gray-500">{g.branchName}</p>
            </div>
            <span className="ml-auto text-xs text-gray-400">
              {g.appointments.length} appointment{g.appointments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div>
            {g.appointments.map(a => (
              <AppointmentRow key={a.id} appt={a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MechanicView({ mechanicId }: { mechanicId: number }) {
  const [todayAppts, setTodayAppts] = useState<AppointmentSummary[]>([]);
  const [tomorrowAppts, setTomorrowAppts] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getMechanicAppointments(mechanicId, 'today'),
      api.getMechanicAppointments(mechanicId, 'tomorrow'),
    ])
      .then(([today, tomorrow]) => {
        setTodayAppts(today);
        setTomorrowAppts(tomorrow);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [mechanicId]);

  if (loading) return <p className="text-gray-500">Loading appointments…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const Section = ({ title, appts }: { title: string; appts: AppointmentSummary[] }) => (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
      {appts.length === 0 ? (
        <p className="text-gray-400 text-sm">No appointments.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {appts.map(a => (
            <Link
              key={a.id}
              to={`/appointments/${a.id}`}
              className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-mono text-gray-400">{a.referenceNumber}</span>
                <StatusBadge status={a.status} />
              </div>
              <p className="font-semibold text-gray-800">{a.customerName}</p>
              <p className="text-sm text-gray-500">{a.vehicleRegistration}</p>
              <p className="text-sm text-gray-600 mt-1">{a.serviceType}</p>
              <p className="text-sm font-medium text-gray-700 mt-2">
                {formatTime(a.startUtc)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <Section title="Today" appts={todayAppts} />
      <Section title="Tomorrow" appts={tomorrowAppts} />
    </div>
  );
}

export function HomePage() {
  const { actingAs } = useActingAs();
  const today = new Date().toLocaleDateString('en-IE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Dublin',
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {actingAs.role === 'admin' ? "Today's Schedule" : 'My Appointments'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>
      {actingAs.role === 'admin' ? (
        <AdminView />
      ) : (
        <MechanicView mechanicId={actingAs.mechanic.id} />
      )}
    </div>
  );
}
