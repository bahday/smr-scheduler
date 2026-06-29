using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Infrastructure.Services;

public class SlotService(AppDbContext db) : ISlotService
{
    public async Task<IEnumerable<AppointmentSlot>> GetAvailableSlotsAsync(
        int? branchId,
        int? serviceTypeId,
        DateTime? fromDate,
        DateTime? toDate)
    {
        var from = (fromDate ?? DateTime.UtcNow.Date).ToUniversalTime();
        var to = (toDate ?? DateTime.UtcNow.Date.AddDays(7)).ToUniversalTime().AddDays(1);

        var query = db.AppointmentSlots
            .AsNoTracking()
            .Include(s => s.Mechanic)
            .Include(s => s.Branch)
            .Where(s => s.IsAvailable && s.StartUtc >= from && s.StartUtc < to);

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        return await query.OrderBy(s => s.StartUtc).ToListAsync();
    }
}
