using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/slots")]
public class SlotsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<SlotDto>> GetAvailableSlots(
        [FromQuery] int? branchId,
        [FromQuery] int? serviceTypeId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var from = (fromDate ?? DateTime.UtcNow.Date).ToUniversalTime();
        var to = (toDate ?? DateTime.UtcNow.Date.AddDays(7)).ToUniversalTime().AddDays(1);

        var query = db.AppointmentSlots
            .Include(s => s.Mechanic)
            .Include(s => s.Branch)
            .Where(s => s.IsAvailable && s.StartUtc >= from && s.StartUtc < to);

        if (branchId.HasValue)
            query = query.Where(s => s.BranchId == branchId.Value);

        return await query
            .OrderBy(s => s.StartUtc)
            .Select(s => new SlotDto(
                s.Id,
                s.MechanicId,
                s.Mechanic.Name,
                s.BranchId,
                s.Branch.Name,
                s.StartUtc,
                s.EndUtc))
            .ToListAsync();
    }
}
