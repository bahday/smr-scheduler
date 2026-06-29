using SmrScheduler.Core.Entities;

namespace SmrScheduler.Core.Interfaces;

public interface ISlotService
{
    Task<IEnumerable<AppointmentSlot>> GetAvailableSlotsAsync(
        int? branchId,
        int? serviceTypeId,
        DateTime? fromDate,
        DateTime? toDate);
}
