using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController(AppDbContext db) : ControllerBase
{
    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<object>>> GetTodaySchedule()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var appointments = await db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Slot)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Where(a => a.Slot.StartUtc >= today && a.Slot.StartUtc < tomorrow)
            .OrderBy(a => a.Slot.StartUtc)
            .ToListAsync();

        var grouped = appointments
            .GroupBy(a => new { a.MechanicId, a.Mechanic.Name, BranchName = a.Branch.Name })
            .Select(g => new
            {
                MechanicId = g.Key.MechanicId,
                MechanicName = g.Key.Name,
                BranchName = g.Key.BranchName,
                Appointments = g.Select(a => new AppointmentSummaryDto(
                    a.Id,
                    a.ReferenceNumber,
                    a.Status.ToString(),
                    a.Customer.Name,
                    a.Customer.VehicleRegistration,
                    a.ServiceType.Name,
                    a.Slot.StartUtc,
                    a.Mechanic.Name,
                    a.Branch.Name)).ToList()
            });

        return Ok(grouped);
    }
}
