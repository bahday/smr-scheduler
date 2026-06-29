using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Enums;

namespace SmrScheduler.Core.Interfaces;

public record BookAppointmentCommand(
    int SlotId,
    int ServiceTypeId,
    string CustomerName,
    string CustomerPhone,
    string VehicleRegistration,
    string? Notes);

public record BookingResult(Appointment Appointment, AppointmentSlot Slot, Customer Customer, ServiceType ServiceType);

public interface IAppointmentService
{
    Task<BookingResult> BookAsync(BookAppointmentCommand command);
    Task<Appointment?> GetByIdAsync(int id);
    Task<WorkNote> AddWorkNoteAsync(int appointmentId, string text);
    Task UpdateStatusAsync(int appointmentId, AppointmentStatus newStatus);
}
