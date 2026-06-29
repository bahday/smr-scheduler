namespace SmrScheduler.Core.Entities;

public class WorkNote
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int AuthorId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public Appointment Appointment { get; set; } = null!;
    public Mechanic Author { get; set; } = null!;
}
