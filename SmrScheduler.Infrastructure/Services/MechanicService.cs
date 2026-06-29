using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Infrastructure.Services;

public class MechanicService(AppDbContext db) : IMechanicService
{
    public async Task<bool> ExistsAsync(int mechanicId) =>
        await db.Mechanics.AnyAsync(m => m.Id == mechanicId);

    public async Task<IEnumerable<Appointment>> GetAppointmentsAsync(int mechanicId, DateOnly date)
    {
        var from = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var to = from.AddDays(1);

        return await db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Slot)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Where(a => a.MechanicId == mechanicId
                     && a.Slot.StartUtc >= from
                     && a.Slot.StartUtc < to)
            .OrderBy(a => a.Slot.StartUtc)
            .ToListAsync();
    }
}
