export interface Branch {
  id: number;
  name: string;
  address: string;
}

export interface ServiceType {
  id: number;
  name: string;
  durationMinutes: number;
}

export interface Mechanic {
  id: number;
  name: string;
  branchId: number;
  branchName: string;
}

export interface Slot {
  id: number;
  mechanicId: number;
  mechanicName: string;
  branchId: number;
  branchName: string;
  startUtc: string;
  endUtc: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  vehicleRegistration: string;
}

export interface WorkNote {
  id: number;
  authorName: string;
  text: string;
  createdUtc: string;
}

export interface AppointmentDetail {
  id: number;
  referenceNumber: string;
  status: AppointmentStatus;
  createdUtc: string;
  customer: Customer;
  slot: Slot;
  serviceType: ServiceType;
  mechanic: Mechanic;
  branch: Branch;
  workNotes: WorkNote[];
}

export interface AppointmentSummary {
  id: number;
  referenceNumber: string;
  status: AppointmentStatus;
  customerName: string;
  vehicleRegistration: string;
  serviceType: string;
  startUtc: string;
  mechanicName: string;
  branchName: string;
}

export interface BookAppointmentRequest {
  slotId: number;
  serviceTypeId: number;
  customerName: string;
  customerPhone: string;
  vehicleRegistration: string;
  notes?: string;
}

export interface BookAppointmentResponse {
  id: number;
  referenceNumber: string;
  customerName: string;
  vehicleRegistration: string;
  serviceType: string;
  mechanicName: string;
  branchName: string;
  startUtc: string;
}

export interface ScheduleGroup {
  mechanicId: number;
  mechanicName: string;
  branchName: string;
  appointments: AppointmentSummary[];
}

export type AppointmentStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow';
