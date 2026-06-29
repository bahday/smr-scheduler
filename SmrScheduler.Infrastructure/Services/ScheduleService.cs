using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Infrastructure.Services;

public class ScheduleService(AppDbContext db) : IScheduleService
{
    public async Task<IEnumerable<MechanicSchedule>> GetTodayScheduleAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var appointments = await db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Slot)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Where(a => a.Slot.StartUtc >= today && a.Slot.StartUtc < tomorrow)
            .OrderBy(a => a.Slot.StartUtc)
            .ToListAsync();

        return appointments
            .GroupBy(a => new { a.MechanicId, MechanicName = a.Mechanic.Name, BranchName = a.Branch.Name })
            .Select(g => new MechanicSchedule(g.Key.MechanicId, g.Key.MechanicName, g.Key.BranchName, g.ToList()));
    }
}
