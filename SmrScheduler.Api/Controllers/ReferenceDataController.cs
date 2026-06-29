using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api")]
public class ReferenceDataController(AppDbContext db) : ControllerBase
{
    [HttpGet("branches")]
    public async Task<IEnumerable<BranchDto>> GetBranches() =>
        await db.Branches
            .Select(b => new BranchDto(b.Id, b.Name, b.Address))
            .ToListAsync();

    [HttpGet("servicetypes")]
    public async Task<IEnumerable<ServiceTypeDto>> GetServiceTypes() =>
        await db.ServiceTypes
            .Select(s => new ServiceTypeDto(s.Id, s.Name, s.DurationMinutes))
            .ToListAsync();

    [HttpGet("mechanics")]
    public async Task<IEnumerable<MechanicDto>> GetMechanics() =>
        await db.Mechanics
            .Include(m => m.Branch)
            .Select(m => new MechanicDto(m.Id, m.Name, m.BranchId, m.Branch.Name))
            .ToListAsync();
}
