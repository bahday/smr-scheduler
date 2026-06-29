namespace SmrScheduler.Core.Entities;

public class Mechanic
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int BranchId { get; set; }

    public Branch Branch { get; set; } = null!;
    public ICollection<AppointmentSlot> AppointmentSlots { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<WorkNote> WorkNotes { get; set; } = [];
}
