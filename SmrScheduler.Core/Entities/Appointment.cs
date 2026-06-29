using SmrScheduler.Core.Enums;

namespace SmrScheduler.Core.Entities;

public class Appointment
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public int SlotId { get; set; }
    public int CustomerId { get; set; }
    public int ServiceTypeId { get; set; }
    public int BranchId { get; set; }
    public int MechanicId { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public AppointmentSlot Slot { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public ServiceType ServiceType { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Mechanic Mechanic { get; set; } = null!;
    public ICollection<WorkNote> WorkNotes { get; set; } = [];
}
