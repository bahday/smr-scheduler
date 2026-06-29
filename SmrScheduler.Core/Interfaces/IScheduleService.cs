using SmrScheduler.Core.Entities;

namespace SmrScheduler.Core.Interfaces;

public interface IScheduleService
{
    Task<IEnumerable<Appointment>> GetTodayAppointmentsAsync();
}
