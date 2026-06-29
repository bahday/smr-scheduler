import { Calendar, Car, ChevronRight, ClipboardList, Clock, User, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { useActingAs } from '../context/ActingAsContext';
import type { AppointmentSummary, ScheduleGroup } from '../types';

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString('en-IE', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Dublin',
  });
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <Calendar size={40} className="text-aa-border mb-3" strokeWidth={1.5} />
      <p className="text-aa-gray-mid text-sm">{message}</p>
    </div>
  );
}

function AppointmentRow({ appt }: { appt: AppointmentSummary }) {
  return (
    <Link
      to={`/appointments/${appt.id}`}
      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-aa-gray-soft border-b border-aa-border last:border-b-0 transition-colors duration-150"
    >
      <span className="w-14 text-sm font-semibold text-aa-dark tabular-nums shrink-0">
        {formatTime(appt.startUtc)}
      </span>
      <span className="w-36 text-xs font-mono text-aa-gray-mid shrink-0 hidden md:block">
        {appt.referenceNumber}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <User size={14} className="text-aa-gray-mid shrink-0" strokeWidth={1.75} />
        <span className="font-medium text-aa-dark text-sm truncate">{appt.customerName}</span>
      </div>
      <div className="flex items-center gap-1.5 w-32 shrink-0 hidden sm:flex">
        <Car size={13} className="text-aa-gray-mid shrink-0" strokeWidth={1.75} />
        <span className="text-xs text-aa-gray-mid truncate">{appt.vehicleRegistration}</span>
      </div>
      <div className="flex items-center gap-1.5 w-28 shrink-0 hidden lg:flex">
        <Wrench size={13} className="text-aa-gray-mid shrink-0" strokeWidth={1.75} />
        <span className="text-xs text-aa-gray-mid truncate">{appt.serviceType}</span>
      </div>
      <StatusBadge status={appt.status} />
      <ChevronRight size={15} className="text-aa-border group-hover:text-aa-gray-mid transition-colors duration-150 shrink-0 ml-1" strokeWidth={2} />
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

  if (loading) return <div className="card p-8 text-center text-sm text-aa-gray-mid">Loading schedule…</div>;
  if (error) return <div className="card p-6 text-sm text-red-600 bg-red-50 border-red-200">{error}</div>;
  if (groups.length === 0) return <EmptyState message="No appointments booked for today." />;

  return (
    <div className="space-y-5">
      {groups.map(g => (
        <div key={g.mechanicId} className="card overflow-hidden">
          <div className="px-5 py-3.5 bg-aa-gray-soft border-b border-aa-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-aa-yellow flex items-center justify-center text-aa-dark font-bold text-xs shrink-0">
              {g.mechanicName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-sm text-aa-dark">{g.mechanicName}</p>
              <p className="text-xs text-aa-gray-mid">{g.branchName}</p>
            </div>
            <span className="ml-auto text-xs font-medium text-aa-gray-mid bg-white border border-aa-border rounded-full px-2.5 py-0.5">
              {g.appointments.length} appt{g.appointments.length !== 1 ? 's' : ''}
            </span>
          </div>
          {g.appointments.map(a => <AppointmentRow key={a.id} appt={a} />)}
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
      .then(([t, tm]) => { setTodayAppts(t); setTomorrowAppts(tm); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [mechanicId]);

  if (loading) return <div className="card p-8 text-center text-sm text-aa-gray-mid">Loading appointments…</div>;
  if (error) return <div className="card p-6 text-sm text-red-600">{error}</div>;

  const Section = ({ title, appts }: { title: string; appts: AppointmentSummary[] }) => (
    <div>
      <h2 className="section-title mb-3">{title}</h2>
      {appts.length === 0 ? (
        <EmptyState message={`No appointments ${title.toLowerCase()}.`} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {appts.map(a => (
            <Link
              key={a.id}
              to={`/appointments/${a.id}`}
              className="card p-4 hover:shadow-card-hover transition-shadow duration-200 group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-aa-gray-mid">{a.referenceNumber}</span>
                <StatusBadge status={a.status} />
              </div>
              <p className="font-semibold text-aa-dark text-sm mb-1">{a.customerName}</p>
              <div className="flex items-center gap-1.5 text-xs text-aa-gray-mid mb-1">
                <Car size={12} strokeWidth={1.75} />
                <span>{a.vehicleRegistration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-aa-gray-mid mb-3">
                <Wrench size={12} strokeWidth={1.75} />
                <span>{a.serviceType}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-aa-border">
                <Clock size={12} className="text-aa-gray-mid" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-aa-dark">{formatTime(a.startUtc)}</span>
              </div>
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">
            {actingAs.role === 'admin' ? "Today's Schedule" : 'My Appointments'}
          </h1>
          <p className="text-sm text-aa-gray-mid mt-1 flex items-center gap-1.5">
            <Calendar size={14} strokeWidth={1.75} />
            {today}
          </p>
        </div>
        <Link to="/book" className="btn-primary hidden sm:flex items-center gap-2">
          <ClipboardList size={15} strokeWidth={1.75} />
          Book Appointment
        </Link>
      </div>

      {actingAs.role === 'admin'
        ? <AdminView />
        : <MechanicView mechanicId={actingAs.mechanic.id} />}
    </div>
  );
}

