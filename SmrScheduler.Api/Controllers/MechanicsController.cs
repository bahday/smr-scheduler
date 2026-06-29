using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/mechanics")]
public class MechanicsController(IMechanicService mechanicService) : ControllerBase
{
    [HttpGet("{id:int}/appointments")]
    public async Task<ActionResult<IEnumerable<AppointmentSummaryDto>>> GetMechanicAppointments(
        int id,
        [FromQuery] string date = "today")
    {
        if (!await mechanicService.ExistsAsync(id))
            return NotFound();

        var targetDate = date.ToLower() == "tomorrow"
            ? DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(1))
            : DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var appointments = await mechanicService.GetAppointmentsAsync(id, targetDate);

        return Ok(appointments.Select(a => new AppointmentSummaryDto(
            a.Id,
            a.ReferenceNumber,
            a.Status.ToString(),
            a.Customer.Name,
            a.Customer.VehicleRegistration,
            a.ServiceType.Name,
            a.Slot.StartUtc,
            a.Mechanic.Name,
            a.Branch.Name)));
    }
}
