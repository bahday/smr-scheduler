namespace SmrScheduler.Core.Entities;

public class ServiceType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = [];
}
