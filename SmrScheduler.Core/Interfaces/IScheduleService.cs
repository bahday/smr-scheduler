using SmrScheduler.Core.Entities;

namespace SmrScheduler.Core.Interfaces;

public record MechanicSchedule(int MechanicId, string MechanicName, string BranchName, IEnumerable<Appointment> Appointments);

public interface IScheduleService
{
    Task<IEnumerable<MechanicSchedule>> GetTodayScheduleAsync();
}
