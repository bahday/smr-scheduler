using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/slots")]
public class SlotsController(ISlotService slotService, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<SlotDto>> GetAvailableSlots(
        [FromQuery] int? branchId,
        [FromQuery] int? serviceTypeId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var slots = await slotService.GetAvailableSlotsAsync(branchId, serviceTypeId, fromDate, toDate);
        return mapper.Map<IEnumerable<SlotDto>>(slots);
    }
}
