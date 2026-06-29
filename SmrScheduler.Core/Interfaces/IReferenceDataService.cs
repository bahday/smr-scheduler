using SmrScheduler.Core.Entities;

namespace SmrScheduler.Core.Interfaces;

public interface IReferenceDataService
{
    Task<IEnumerable<Branch>> GetBranchesAsync();
    Task<IEnumerable<ServiceType>> GetServiceTypesAsync();
    Task<IEnumerable<Mechanic>> GetMechanicsAsync();
}
