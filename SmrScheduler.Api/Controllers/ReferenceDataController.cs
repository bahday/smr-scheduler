using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api")]
public class ReferenceDataController(IReferenceDataService referenceDataService) : ControllerBase
{
    [HttpGet("branches")]
    public async Task<IEnumerable<BranchDto>> GetBranches()
    {
        var branches = await referenceDataService.GetBranchesAsync();
        return branches.Select(b => new BranchDto(b.Id, b.Name, b.Address));
    }

    [HttpGet("servicetypes")]
    public async Task<IEnumerable<ServiceTypeDto>> GetServiceTypes()
    {
        var types = await referenceDataService.GetServiceTypesAsync();
        return types.Select(s => new ServiceTypeDto(s.Id, s.Name, s.DurationMinutes));
    }

    [HttpGet("mechanics")]
    public async Task<IEnumerable<MechanicDto>> GetMechanics()
    {
        var mechanics = await referenceDataService.GetMechanicsAsync();
        return mechanics.Select(m => new MechanicDto(m.Id, m.Name, m.BranchId, m.Branch.Name));
    }
}
