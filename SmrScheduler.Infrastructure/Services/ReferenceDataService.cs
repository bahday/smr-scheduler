using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Infrastructure.Services;

public class ReferenceDataService(AppDbContext db) : IReferenceDataService
{
    public async Task<IEnumerable<Branch>> GetBranchesAsync() =>
        await db.Branches.AsNoTracking().ToListAsync();

    public async Task<IEnumerable<ServiceType>> GetServiceTypesAsync() =>
        await db.ServiceTypes.AsNoTracking().ToListAsync();

    public async Task<IEnumerable<Mechanic>> GetMechanicsAsync() =>
        await db.Mechanics.AsNoTracking().Include(m => m.Branch).ToListAsync();
}
