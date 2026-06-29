using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController(IScheduleService scheduleService, IMapper mapper) : ControllerBase
{
    [HttpGet("today")]
    public async Task<IEnumerable<ScheduleGroupDto>> GetTodaySchedule()
    {
        var appointments = await scheduleService.GetTodayAppointmentsAsync();

        return appointments
            .GroupBy(a => new { a.MechanicId, MechanicName = a.Mechanic.Name, BranchName = a.Branch.Name })
            .Select(g => new ScheduleGroupDto(
                g.Key.MechanicId,
                g.Key.MechanicName,
                g.Key.BranchName,
                mapper.Map<IEnumerable<AppointmentSummaryDto>>(g)));
    }
}
