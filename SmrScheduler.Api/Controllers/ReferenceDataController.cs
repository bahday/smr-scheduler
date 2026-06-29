using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api")]
public class ReferenceDataController(IReferenceDataService referenceDataService, IMapper mapper) : ControllerBase
{
    [HttpGet("branches")]
    public async Task<IEnumerable<BranchDto>> GetBranches()
    {
        var branches = await referenceDataService.GetBranchesAsync();
        return mapper.Map<IEnumerable<BranchDto>>(branches);
    }

    [HttpGet("servicetypes")]
    public async Task<IEnumerable<ServiceTypeDto>> GetServiceTypes()
    {
        var types = await referenceDataService.GetServiceTypesAsync();
        return mapper.Map<IEnumerable<ServiceTypeDto>>(types);
    }

    [HttpGet("mechanics")]
    public async Task<IEnumerable<MechanicDto>> GetMechanics()
    {
        var mechanics = await referenceDataService.GetMechanicsAsync();
        return mapper.Map<IEnumerable<MechanicDto>>(mechanics);
    }
}
