namespace SmrScheduler.Core.Entities;

public class Branch
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ICollection<Mechanic> Mechanics { get; set; } = [];
    public ICollection<AppointmentSlot> AppointmentSlots { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
}
