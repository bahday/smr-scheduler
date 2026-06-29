import type {
  AppointmentDetail,
  AppointmentSummary,
  BookAppointmentRequest,
  BookAppointmentResponse,
  Branch,
  Mechanic,
  ScheduleGroup,
  ServiceType,
  Slot,
  WorkNote,
} from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5050';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getBranches: () => request<Branch[]>('/api/branches'),
  getServiceTypes: () => request<ServiceType[]>('/api/servicetypes'),
  getMechanics: () => request<Mechanic[]>('/api/mechanics'),

  getSlots: (params: {
    branchId?: number;
    serviceTypeId?: number;
    fromDate?: string;
    toDate?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.branchId) qs.set('branchId', String(params.branchId));
    if (params.serviceTypeId) qs.set('serviceTypeId', String(params.serviceTypeId));
    if (params.fromDate) qs.set('fromDate', params.fromDate);
    if (params.toDate) qs.set('toDate', params.toDate);
    return request<Slot[]>(`/api/slots?${qs}`);
  },

  bookAppointment: (body: BookAppointmentRequest) =>
    request<BookAppointmentResponse>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAppointment: (id: number) =>
    request<AppointmentDetail>(`/api/appointments/${id}`),

  addWorkNote: (id: number, text: string) =>
    request<WorkNote>(`/api/appointments/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  updateStatus: (id: number, status: string) =>
    request<void>(`/api/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getMechanicAppointments: (id: number, date: 'today' | 'tomorrow') =>
    request<AppointmentSummary[]>(`/api/mechanics/${id}/appointments?date=${date}`),

  getTodaySchedule: () => request<ScheduleGroup[]>('/api/schedule/today'),
};
