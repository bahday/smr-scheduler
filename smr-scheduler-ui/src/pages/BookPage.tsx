import { useEffect, useState } from 'react';
import { api } from '../api';
import type { BookAppointmentResponse, Branch, ServiceType, Slot } from '../types';

type Step = 1 | 2 | 3 | 'confirmed';

function groupSlotsByDay(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.startUtc).toLocaleDateString('en-IE', {
      timeZone: 'Europe/Dublin',
    });
    (acc[day] ??= []).push(slot);
    return acc;
  }, {});
}

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString('en-IE', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Dublin',
  });
}

function formatDayHeader(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IE', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export function BookPage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | ''>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Step 2 state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Step 3 state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Confirmation state
  const [confirmation, setConfirmation] = useState<BookAppointmentResponse | null>(null);

  useEffect(() => {
    Promise.all([api.getBranches(), api.getServiceTypes()])
      .then(([b, s]) => { setBranches(b); setServiceTypes(s); })
      .catch(console.error);
  }, []);

  function handleStep1Submit() {
    if (!selectedBranchId || !selectedServiceTypeId) return;
    setSlotsLoading(true);
    setSlotsError('');
    api.getSlots({ branchId: selectedBranchId as number, serviceTypeId: selectedServiceTypeId as number })
      .then(s => { setSlots(s); setStep(2); })
      .catch(e => setSlotsError(e.message))
      .finally(() => setSlotsLoading(false));
  }

  async function handleBooking() {
    if (!selectedSlot || !customerName || !customerPhone || !vehicleReg) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await api.bookAppointment({
        slotId: selectedSlot.id,
        serviceTypeId: selectedServiceTypeId as number,
        customerName,
        customerPhone,
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
    setStep(1);
    setSelectedBranchId('');
    setSelectedServiceTypeId('');
    setSlots([]);
    setSelectedSlot(null);
    setCustomerName('');
    setCustomerPhone('');
    setVehicleReg('');
    setNotes('');
    setConfirmation(null);
  }

  if (step === 'confirmed' && confirmation) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking Confirmed</h2>
              <p className="text-sm text-gray-500">Your appointment has been booked.</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-yellow-700 font-medium uppercase tracking-wide mb-1">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-yellow-800">{confirmation.referenceNumber}</p>
          </div>
          <dl className="space-y-2 text-sm">
            {[
              ['Customer', confirmation.customerName],
              ['Vehicle', confirmation.vehicleRegistration],
              ['Service', confirmation.serviceType],
              ['Mechanic', confirmation.mechanicName],
              ['Branch', confirmation.branchName],
              ['Time', new Date(confirmation.startUtc).toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short' })],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-20 text-gray-500 shrink-0">{label}</dt>
                <dd className="font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
          <button
            onClick={reset}
            className="mt-6 w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  const slotsByDay = groupSlotsByDay(slots);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              (step as number) >= n ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-500'
            }`}>
              {n}
            </div>
            <span className={`text-sm ${(step as number) >= n ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {n === 1 ? 'Select service' : n === 2 ? 'Pick a slot' : 'Your details'}
            </span>
            {n < 3 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select a branch…</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={selectedServiceTypeId}
              onChange={e => setSelectedServiceTypeId(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select a service…</option>
              {serviceTypes.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
          </div>
          {slotsError && <p className="text-red-600 text-sm">{slotsError}</p>}
          <button
            onClick={handleStep1Submit}
            disabled={!selectedBranchId || !selectedServiceTypeId || slotsLoading}
            className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {slotsLoading ? 'Loading slots…' : 'Find Available Slots →'}
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Available Slots</h2>
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
          </div>
          {slots.length === 0 ? (
            <p className="text-gray-500 text-sm">No available slots found. Try different filters.</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(slotsByDay).map(([day, daySlots]) => (
                <div key={day}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {formatDayHeader(day)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          selectedSlot?.id === slot.id
                            ? 'bg-yellow-400 border-yellow-400 text-gray-900 font-semibold'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-yellow-300'
                        }`}
                      >
                        {formatTime(slot.startUtc)}
                        <span className="text-xs ml-1 opacity-70">{slot.mechanicName.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedSlot && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
              <p className="font-medium text-yellow-900">Selected slot:</p>
              <p className="text-yellow-800">
                {new Date(selectedSlot.startUtc).toLocaleString('en-IE', {
                  timeZone: 'Europe/Dublin', dateStyle: 'medium', timeStyle: 'short',
                })} — {selectedSlot.mechanicName} @ {selectedSlot.branchName}
              </p>
            </div>
          )}
          <button
            onClick={() => setStep(3)}
            disabled={!selectedSlot}
            className="mt-4 w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Customer Details</h2>
            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
          </div>
          {[
            { label: 'Full Name', value: customerName, onChange: setCustomerName, placeholder: 'e.g. Aoife Murphy' },
            { label: 'Phone Number', value: customerPhone, onChange: setCustomerPhone, placeholder: 'e.g. 087-123-4567' },
            { label: 'Vehicle Registration', value: vehicleReg, onChange: setVehicleReg, placeholder: 'e.g. 241-D-12345' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type="text"
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional information for the mechanic…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
          <button
            onClick={handleBooking}
            disabled={!customerName || !customerPhone || !vehicleReg || submitting}
            className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Booking…' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
}
