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
        var groups = await scheduleService.GetTodayScheduleAsync();
        return mapper.Map<IEnumerable<ScheduleGroupDto>>(groups);
    }
}
