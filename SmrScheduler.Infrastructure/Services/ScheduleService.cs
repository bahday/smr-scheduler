using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Infrastructure.Services;

public class ScheduleService(AppDbContext db) : IScheduleService
{
    public async Task<IEnumerable<Appointment>> GetTodayAppointmentsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        return await db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Slot)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Where(a => a.Slot.StartUtc >= today && a.Slot.StartUtc < tomorrow)
            .OrderBy(a => a.Slot.StartUtc)
            .ToListAsync();
    }
}
