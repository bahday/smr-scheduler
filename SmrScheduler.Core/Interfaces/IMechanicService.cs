using SmrScheduler.Core.Entities;

namespace SmrScheduler.Core.Interfaces;

public interface IMechanicService
{
    Task<bool> ExistsAsync(int mechanicId);
    Task<IEnumerable<Appointment>> GetAppointmentsAsync(int mechanicId, DateOnly date);
}
