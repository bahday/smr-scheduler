using SmrScheduler.Core.Enums;

namespace SmrScheduler.Api.DTOs;

public record BookAppointmentRequest(
    int SlotId,
    int ServiceTypeId,
    string CustomerName,
    string CustomerPhone,
    string VehicleRegistration,
    string? Notes);

public record BookAppointmentResponse(
    int Id,
    string ReferenceNumber,
    string CustomerName,
    string VehicleRegistration,
    string ServiceType,
    string MechanicName,
    string BranchName,
    DateTime StartUtc);

public record WorkNoteDto(int Id, string AuthorName, string Text, DateTime CreatedUtc);

public record AppointmentDetailDto(
    int Id,
    string ReferenceNumber,
    string Status,
    DateTime CreatedUtc,
    CustomerDto Customer,
    SlotDto Slot,
    ServiceTypeDto ServiceType,
    MechanicDto Mechanic,
    BranchDto Branch,
    IEnumerable<WorkNoteDto> WorkNotes);

public record CustomerDto(int Id, string Name, string Phone, string VehicleRegistration);

public record AddWorkNoteRequest(string Text);

public record UpdateStatusRequest(string Status);

public record AppointmentSummaryDto(
    int Id,
    string ReferenceNumber,
    string Status,
    string CustomerName,
    string VehicleRegistration,
    string ServiceType,
    DateTime StartUtc,
    string MechanicName,
    string BranchName);

public record ScheduleGroupDto(
    int MechanicId,
    string MechanicName,
    string BranchName,
    IEnumerable<AppointmentSummaryDto> Appointments);
