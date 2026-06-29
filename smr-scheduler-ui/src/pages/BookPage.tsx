import { CalendarDays, Car, Check, ChevronLeft, Clock, MapPin, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { BookAppointmentResponse, Branch, ServiceType, Slot } from '../types';

type Step = 1 | 2 | 3 | 'confirmed';

function groupSlotsByDay(slots: Slot[]): [string, Slot[]][] {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = new Date(slot.startUtc).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return Array.from(map.entries());
}

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString('en-IE', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Dublin',
  });
}

function formatDayHeader(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00Z');
  const isToday = new Date().toISOString().slice(0, 10) === isoDate;
  const isTomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10) === isoDate;
  const label = d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' });
  return isToday ? `Today — ${label}` : isTomorrow ? `Tomorrow — ${label}` : label;
}

const STEPS = ['Service', 'Slot', 'Details'] as const;

export function BookPage() {
  const [step, setStep] = useState<Step>(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | ''>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState<BookAppointmentResponse | null>(null);

  useEffect(() => {
    Promise.all([api.getBranches(), api.getServiceTypes()])
      .then(([b, s]) => { setBranches(b); setServiceTypes(s); })
      .catch(console.error);
  }, []);

  function handleFindSlots() {
    if (!selectedBranchId || !selectedServiceTypeId) return;
    setSlotsLoading(true); setSlotsError('');
    api.getSlots({ branchId: selectedBranchId as number, serviceTypeId: selectedServiceTypeId as number })
      .then(s => { setSlots(s); setStep(2); })
      .catch(e => setSlotsError(e.message))
      .finally(() => setSlotsLoading(false));
  }

  async function handleBooking() {
    if (!selectedSlot || !customerName || !customerPhone || !vehicleReg) return;
    setSubmitting(true); setSubmitError('');
    try {
      const result = await api.bookAppointment({
        slotId: selectedSlot.id,
        serviceTypeId: selectedServiceTypeId as number,
        customerName, customerPhone,
        vehicleRegistration: vehicleReg,
        notes: notes || undefined,
      });
      setConfirmation(result);
      setStep('confirmed');
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(1); setSelectedBranchId(''); setSelectedServiceTypeId('');
    setSlots([]); setSelectedSlot(null); setCustomerName('');
    setCustomerPhone(''); setVehicleReg(''); setNotes(''); setConfirmation(null);
  }

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (step === 'confirmed' && confirmation) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8">
          <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={22} className="text-green-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-aa-dark text-center mb-1">Booking Confirmed</h2>
          <p className="text-sm text-aa-gray-mid text-center mb-6">Reference saved to the system.</p>

          <div className="bg-aa-yellow/10 border border-aa-yellow rounded-card p-4 mb-6 text-center">
            <p className="text-xs text-aa-gray font-medium uppercase tracking-wider mb-1">Reference Number</p>
            <p className="text-3xl font-mono font-bold text-aa-dark">{confirmation.referenceNumber}</p>
          </div>

          <dl className="space-y-3 text-sm">
            {[
              [<Car size={14} strokeWidth={1.75} />, 'Vehicle',    confirmation.vehicleRegistration],
              [<Wrench size={14} strokeWidth={1.75} />, 'Service', confirmation.serviceType],
              [<Clock size={14} strokeWidth={1.75} />, 'Time',
                new Date(confirmation.startUtc).toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' })],
              [<MapPin size={14} strokeWidth={1.75} />, 'Branch',  confirmation.branchName],
            ].map(([icon, label, value]) => (
              <div key={label as string} className="flex items-center gap-3 py-2.5 border-b border-aa-border last:border-b-0">
                <span className="text-aa-gray-mid">{icon}</span>
                <span className="text-aa-gray-mid w-16 shrink-0">{label}</span>
                <span className="font-medium text-aa-dark">{value as string}</span>
              </div>
            ))}
          </dl>

          <button onClick={reset} className="btn-primary w-full mt-6">
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  const slotsByDay = groupSlotsByDay(slots);
  const selectedService = serviceTypes.find(s => s.id === selectedServiceTypeId);
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Book an Appointment</h1>

      {/* Step indicator */}
      <div className="card p-4 mb-6">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const done = (step as number) > n;
            const active = step === n;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-200 ${
                    done    ? 'bg-aa-dark text-white'
                    : active ? 'bg-aa-yellow text-aa-dark'
                    :          'bg-aa-border text-aa-gray-mid'
                  }`}>
                    {done ? <Check size={13} strokeWidth={2.5} /> : n}
                  </div>
                  <span className={`text-sm hidden sm:block truncate ${active ? 'font-semibold text-aa-dark' : 'text-aa-gray-mid'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 transition-colors duration-200 ${(step as number) > n ? 'bg-aa-dark' : 'bg-aa-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="form-label">
              <MapPin size={14} className="inline mr-1.5 text-aa-gray-mid" strokeWidth={1.75} />
              Branch
            </label>
            <select value={selectedBranchId} onChange={e => setSelectedBranchId(Number(e.target.value))} className="form-select">
              <option value="">Select a branch…</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">
              <Wrench size={14} className="inline mr-1.5 text-aa-gray-mid" strokeWidth={1.75} />
              Service Type
            </label>
            <select value={selectedServiceTypeId} onChange={e => setSelectedServiceTypeId(Number(e.target.value))} className="form-select">
              <option value="">Select a service…</option>
              {serviceTypes.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
          </div>
          {slotsError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{slotsError}</p>}
          <button onClick={handleFindSlots} disabled={!selectedBranchId || !selectedServiceTypeId || slotsLoading} className="btn-primary w-full">
            {slotsLoading ? 'Loading slots…' : 'Find Available Slots'}
          </button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Available Slots</h2>
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
              <ChevronLeft size={14} strokeWidth={2} /> Back
            </button>
          </div>

          {/* Context pill */}
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedBranch && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-aa-gray-soft border border-aa-border rounded-full px-3 py-1 text-aa-gray">
                <MapPin size={12} strokeWidth={1.75} />{selectedBranch.name}
              </span>
            )}
            {selectedService && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-aa-gray-soft border border-aa-border rounded-full px-3 py-1 text-aa-gray">
                <Wrench size={12} strokeWidth={1.75} />{selectedService.name} · {selectedService.durationMinutes} min
              </span>
            )}
          </div>

          {slots.length === 0 ? (
            <p className="text-sm text-aa-gray-mid text-center py-8">No available slots. Try different filters.</p>
          ) : (
            <div className="space-y-5">
              {slotsByDay.map(([isoDay, daySlots]) => (
                <div key={isoDay}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <CalendarDays size={13} className="text-aa-gray-mid" strokeWidth={1.75} />
                    <p className="text-xs font-semibold text-aa-gray uppercase tracking-wide">{formatDayHeader(isoDay)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3.5 py-2 rounded-btn text-sm font-medium border transition-all duration-150 ${
                          selectedSlot?.id === slot.id
                            ? 'bg-aa-yellow border-aa-yellow text-aa-dark shadow-sm'
                            : 'bg-white border-aa-border text-aa-dark hover:border-aa-yellow hover:bg-aa-yellow-s'
                        }`}
                      >
                        {formatTime(slot.startUtc)}
                        <span className="text-xs ml-1.5 opacity-60">{slot.mechanicName.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-5 p-3.5 bg-aa-yellow-s border border-aa-yellow rounded-card text-sm flex items-center gap-2">
              <Clock size={14} className="text-aa-dark shrink-0" strokeWidth={1.75} />
              <span className="font-medium text-aa-dark">
                {new Date(selectedSlot.startUtc).toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' })}
                {' '}&mdash; {selectedSlot.mechanicName}
              </span>
            </div>
          )}

          <button onClick={() => setStep(3)} disabled={!selectedSlot} className="btn-primary w-full mt-5">
            Continue to Details
          </button>
        </div>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Customer Details</h2>
            <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
              <ChevronLeft size={14} strokeWidth={2} /> Back
            </button>
          </div>

          {[
            { label: 'Full Name', value: customerName, set: setCustomerName, placeholder: 'e.g. Aoife Murphy', icon: 'user' },
            { label: 'Phone Number', value: customerPhone, set: setCustomerPhone, placeholder: 'e.g. 087-123-4567', icon: 'phone' },
            { label: 'Vehicle Registration', value: vehicleReg, set: setVehicleReg, placeholder: 'e.g. 241-D-12345', icon: 'car' },
          ].map(f => (
            <div key={f.label}>
              <label className="form-label">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="form-input"
              />
            </div>
          ))}

          <div>
            <label className="form-label">
              Notes <span className="text-aa-gray-mid font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional information for the mechanic…"
              className="form-input resize-none"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">{submitError}</p>
          )}

          <button
            onClick={handleBooking}
            disabled={!customerName || !customerPhone || !vehicleReg || submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Confirming…' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
}
