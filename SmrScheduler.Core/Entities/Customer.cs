namespace SmrScheduler.Core.Entities;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string VehicleRegistration { get; set; } = string.Empty;

    public ICollection<Appointment> Appointments { get; set; } = [];
}
