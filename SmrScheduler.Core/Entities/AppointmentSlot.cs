namespace SmrScheduler.Core.Entities;

public class AppointmentSlot
{
    public int Id { get; set; }
    public int MechanicId { get; set; }
    public int BranchId { get; set; }
    public DateTime StartUtc { get; set; }
    public DateTime EndUtc { get; set; }
    public bool IsAvailable { get; set; } = true;

    public Mechanic Mechanic { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Appointment? Appointment { get; set; }
}
