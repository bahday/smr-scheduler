import { ArrowLeft, Car, CheckCircle, Clock, MapPin, MessageSquare, Phone, Send, User, Wrench, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import type { AppointmentDetail, AppointmentStatus } from '../types';

function formatDateTime(utc: string) {
  return new Date(utc).toLocaleString('en-IE', {
    timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short',
  });
}

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  Scheduled:  ['InProgress', 'NoShow'],
  InProgress: ['Completed'],
  Completed:  [],
  NoShow:     [],
};

const ACTION_CONFIG: Record<AppointmentStatus, { label: string; className: string; Icon: React.ElementType }> = {
  InProgress: { label: 'Start Work',     className: 'btn-primary flex items-center gap-2',  Icon: Wrench },
  Completed:  { label: 'Mark Complete',  className: 'btn-primary flex items-center gap-2',  Icon: CheckCircle },
  NoShow:     { label: 'Mark No Show',   className: 'btn-danger flex items-center gap-2',   Icon: XCircle },
  Scheduled:  { label: '',               className: '',                                       Icon: () => null },
};

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [appt, setAppt] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  function load() {
    if (!id) return;
    api.getAppointment(Number(id))
      .then(setAppt)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function handleAddNote() {
    if (!noteText.trim() || !id) return;
    setAddingNote(true); setNoteError('');
    try {
      await api.addWorkNote(Number(id), noteText.trim());
      setNoteText('');
      load();
    } catch (e: any) {
      setNoteError(e.message);
    } finally {
      setAddingNote(false);
    }
  }

  async function handleStatus(newStatus: AppointmentStatus) {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      await api.updateStatus(Number(id), newStatus);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) return <div className="card p-10 text-center text-sm text-aa-gray-mid">Loading…</div>;
  if (error)   return <div className="card p-6 text-sm text-red-600 bg-red-50 border-red-200">{error}</div>;
  if (!appt)   return null;

  const transitions = TRANSITIONS[appt.status];

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-aa-gray-mid hover:text-aa-dark transition-colors duration-150">
        <ArrowLeft size={15} strokeWidth={2} /> Back to Schedule
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-mono text-aa-gray-mid mb-1">{appt.referenceNumber}</p>
            <h1 className="text-xl font-bold text-aa-dark">{appt.customer.name}</h1>
          </div>
          <StatusBadge status={appt.status} />
        </div>

        {/* Customer info row */}
        <div className="flex flex-wrap gap-4 text-sm pb-5 border-b border-aa-border">
          <div className="flex items-center gap-2 text-aa-gray-mid">
            <Phone size={14} strokeWidth={1.75} />
            <span>{appt.customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-aa-gray-mid">
            <Car size={14} strokeWidth={1.75} />
            <span className="font-medium text-aa-dark">{appt.customer.vehicleRegistration}</span>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5">
          {[
            { Icon: Wrench,  label: 'Service',  value: appt.serviceType.name },
            { Icon: Clock,   label: 'Duration', value: `${appt.serviceType.durationMinutes} min` },
            { Icon: Clock,   label: 'Time',     value: formatDateTime(appt.slot.startUtc) },
            { Icon: User,    label: 'Mechanic', value: appt.mechanic.name },
            { Icon: MapPin,  label: 'Branch',   value: appt.branch.name },
            { Icon: Clock,   label: 'Booked',   value: formatDateTime(appt.createdUtc) },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={12} className="text-aa-gray-mid shrink-0" strokeWidth={1.75} />
                <p className="text-xs text-aa-gray-mid uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-sm font-semibold text-aa-dark truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status actions */}
      {transitions.length > 0 && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-aa-gray-mid uppercase tracking-wide mb-3">Update Status</p>
          <div className="flex flex-wrap gap-3">
            {transitions.map(s => {
              const { label, className, Icon } = ACTION_CONFIG[s];
              return (
                <button key={s} onClick={() => handleStatus(s)} disabled={updatingStatus} className={className}>
                  <Icon size={15} strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Work notes */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare size={16} className="text-aa-gray-mid" strokeWidth={1.75} />
          <h2 className="section-title">Work Notes</h2>
          {appt.workNotes.length > 0 && (
            <span className="ml-auto text-xs bg-aa-gray-soft border border-aa-border rounded-full px-2.5 py-0.5 text-aa-gray-mid">
              {appt.workNotes.length}
            </span>
          )}
        </div>

        {/* Add note */}
        <div className="mb-6">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={3}
            placeholder="Add a work note…"
            className="form-input resize-none mb-2"
          />
          {noteError && <p className="text-xs text-red-600 mb-2">{noteError}</p>}
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim() || addingNote}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={14} strokeWidth={1.75} />
            {addingNote ? 'Adding…' : 'Add Note'}
          </button>
        </div>

        {/* Timeline */}
        {appt.workNotes.length === 0 ? (
          <div className="text-center py-6 border-t border-aa-border">
            <MessageSquare size={28} className="text-aa-border mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-aa-gray-mid">No work notes yet.</p>
          </div>
        ) : (
          <div className="border-t border-aa-border pt-5 space-y-4">
            {appt.workNotes.map(note => (
              <div key={note.id} className="flex gap-3">
                <div className="w-0.5 bg-aa-yellow rounded-full shrink-0 self-stretch mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-aa-dark">{note.authorName}</span>
                    <span className="text-xs text-aa-gray-mid">{formatDateTime(note.createdUtc)}</span>
                  </div>
                  <p className="text-sm text-aa-gray leading-relaxed">{note.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
