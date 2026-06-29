import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import type { AppointmentDetail, AppointmentStatus } from '../types';

function formatDateTime(utc: string) {
  return new Date(utc).toLocaleString('en-IE', {
    timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short',
  });
}

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  Scheduled: ['InProgress', 'NoShow'],
  InProgress: ['Completed'],
  Completed: [],
  NoShow: [],
};

const BUTTON_LABELS: Record<AppointmentStatus, string> = {
  InProgress: 'Start Work',
  Completed: 'Mark Complete',
  NoShow: 'Mark No Show',
  Scheduled: '',
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

  function loadAppointment() {
    if (!id) return;
    setLoading(true);
    api.getAppointment(Number(id))
      .then(setAppt)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAppointment(); }, [id]);

  async function handleAddNote() {
    if (!noteText.trim() || !id) return;
    setAddingNote(true);
    setNoteError('');
    try {
      await api.addWorkNote(Number(id), noteText.trim());
      setNoteText('');
      loadAppointment();
    } catch (e: any) {
      setNoteError(e.message);
    } finally {
      setAddingNote(false);
    }
  }

  async function handleStatusUpdate(newStatus: AppointmentStatus) {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      await api.updateStatus(Number(id), newStatus);
      loadAppointment();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) return <p className="text-gray-500 mt-8">Loading…</p>;
  if (error) return <p className="text-red-600 mt-8">{error}</p>;
  if (!appt) return null;

  const transitions = TRANSITIONS[appt.status];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-mono text-gray-400">{appt.referenceNumber}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{appt.customer.name}</h1>
          <p className="text-gray-500 text-sm">{appt.customer.vehicleRegistration} · {appt.customer.phone}</p>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-xl border shadow-sm p-5 grid grid-cols-2 gap-4 text-sm">
        {[
          ['Service', appt.serviceType.name],
          ['Duration', `${appt.serviceType.durationMinutes} min`],
          ['Mechanic', appt.mechanic.name],
          ['Branch', appt.branch.name],
          ['Appointment Time', formatDateTime(appt.slot.startUtc)],
          ['Booked At', formatDateTime(appt.createdUtc)],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
            <p className="font-medium text-gray-800 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Status actions */}
      {transitions.length > 0 && (
        <div className="flex gap-3">
          {transitions.map(s => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={updatingStatus}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                s === 'NoShow'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
              }`}
            >
              {BUTTON_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Work notes */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Work Notes</h2>

        {/* Add note */}
        <div className="mb-5">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={3}
            placeholder="Add a work note…"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {noteError && <p className="text-red-600 text-xs mt-1">{noteError}</p>}
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim() || addingNote}
            className="mt-2 px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {addingNote ? 'Adding…' : 'Add Note'}
          </button>
        </div>

        {/* Notes timeline */}
        {appt.workNotes.length === 0 ? (
          <p className="text-gray-400 text-sm">No work notes yet.</p>
        ) : (
          <div className="space-y-3">
            {appt.workNotes.map(note => (
              <div key={note.id} className="border-l-2 border-yellow-400 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">{note.authorName}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(note.createdUtc)}</span>
                </div>
                <p className="text-sm text-gray-700">{note.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
