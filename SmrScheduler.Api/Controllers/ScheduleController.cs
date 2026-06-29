using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController(IScheduleService scheduleService) : ControllerBase
{
    [HttpGet("today")]
    public async Task<IActionResult> GetTodaySchedule()
    {
        var appointments = await scheduleService.GetTodayAppointmentsAsync();

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
