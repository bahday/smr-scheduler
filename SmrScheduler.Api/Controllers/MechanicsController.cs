using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/mechanics")]
public class MechanicsController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id:int}/appointments")]
    public async Task<ActionResult<IEnumerable<AppointmentSummaryDto>>> GetMechanicAppointments(
        int id,
        [FromQuery] string date = "today")
    {
        var mechanic = await db.Mechanics.FindAsync(id);
        if (mechanic is null)
            return NotFound();

        var targetDate = date.ToLower() switch
        {
            "tomorrow" => DateTime.UtcNow.Date.AddDays(1),
            _ => DateTime.UtcNow.Date
        };

        var from = targetDate;
        var to = targetDate.AddDays(1);

        var appointments = await db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Slot)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Where(a => a.MechanicId == id && a.Slot.StartUtc >= from && a.Slot.StartUtc < to)
            .OrderBy(a => a.Slot.StartUtc)
            .Select(a => new AppointmentSummaryDto(
                a.Id,
                a.ReferenceNumber,
                a.Status.ToString(),
                a.Customer.Name,
                a.Customer.VehicleRegistration,
                a.ServiceType.Name,
                a.Slot.StartUtc,
                a.Mechanic.Name,
                a.Branch.Name))
            .ToListAsync();

        return Ok(appointments);
    }
}
