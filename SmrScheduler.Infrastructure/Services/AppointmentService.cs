using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Enums;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Infrastructure.Services;

public class AppointmentService(AppDbContext db, ILogger<AppointmentService> logger) : IAppointmentService
{
    private static readonly Dictionary<AppointmentStatus, AppointmentStatus[]> ValidTransitions = new()
    {
        [AppointmentStatus.Scheduled]  = [AppointmentStatus.InProgress, AppointmentStatus.NoShow],
        [AppointmentStatus.InProgress] = [AppointmentStatus.Completed],
        [AppointmentStatus.Completed]  = [],
        [AppointmentStatus.NoShow]     = [],
    };

    public async Task<BookingResult> BookAsync(BookAppointmentCommand command)
    {
        logger.LogInformation("Booking appointment for slot {SlotId}", command.SlotId);

        await using var transaction = await db.Database.BeginTransactionAsync();

        var marked = await db.AppointmentSlots
            .Where(s => s.Id == command.SlotId && s.IsAvailable)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsAvailable, false));

        if (marked == 0)
        {
            var exists = await db.AppointmentSlots.AnyAsync(s => s.Id == command.SlotId);
            if (!exists)
            {
                logger.LogWarning("Slot {SlotId} not found", command.SlotId);
                throw new KeyNotFoundException($"Slot {command.SlotId} not found.");
            }
            logger.LogWarning("Slot {SlotId} already booked", command.SlotId);
            throw new InvalidOperationException("CONFLICT: This slot has already been booked.");
        }

        var slot = await db.AppointmentSlots
            .Include(s => s.Mechanic)
            .Include(s => s.Branch)
            .FirstAsync(s => s.Id == command.SlotId);

        var serviceType = await db.ServiceTypes.FindAsync(command.ServiceTypeId)
            ?? throw new KeyNotFoundException($"Service type {command.ServiceTypeId} not found.");

        var customer = new Customer
        {
            Name = command.CustomerName,
            Phone = command.CustomerPhone,
            VehicleRegistration = command.VehicleRegistration,
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        var today = DateTime.UtcNow.Date;
        var todayCount = await db.Appointments
            .CountAsync(a => a.CreatedUtc >= today && a.CreatedUtc < today.AddDays(1));
        var refNumber = $"AA-{today:yyyyMMdd}-{(todayCount + 1):D3}";

        var appointment = new Appointment
        {
            ReferenceNumber = refNumber,
            SlotId = slot.Id,
            CustomerId = customer.Id,
            ServiceTypeId = serviceType.Id,
            BranchId = slot.BranchId,
            MechanicId = slot.MechanicId,
            Status = AppointmentStatus.Scheduled,
            CreatedUtc = DateTime.UtcNow,
        };
        db.Appointments.Add(appointment);
        await db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(command.Notes))
        {
            db.WorkNotes.Add(new WorkNote
            {
                AppointmentId = appointment.Id,
                AuthorId = slot.MechanicId,
                Text = $"Customer notes: {command.Notes}",
                CreatedUtc = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
        }

        await transaction.CommitAsync();

        logger.LogInformation("Appointment {RefNumber} created for slot {SlotId}", refNumber, command.SlotId);
        return new BookingResult(appointment, slot, customer, serviceType);
    }

    public async Task<Appointment?> GetByIdAsync(int id) =>
        await db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Slot).ThenInclude(s => s.Branch)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Include(a => a.WorkNotes).ThenInclude(n => n.Author)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<WorkNote> AddWorkNoteAsync(int appointmentId, string text)
    {
        var appointment = await db.Appointments.FindAsync(appointmentId)
            ?? throw new KeyNotFoundException($"Appointment {appointmentId} not found.");

        var note = new WorkNote
        {
            AppointmentId = appointmentId,
            AuthorId = appointment.MechanicId,
            Text = text,
            CreatedUtc = DateTime.UtcNow,
        };
        db.WorkNotes.Add(note);
        await db.SaveChangesAsync();

        await db.Entry(note).Reference(n => n.Author).LoadAsync();

        logger.LogInformation("Work note added to appointment {AppointmentId}", appointmentId);
        return note;
    }

    public async Task UpdateStatusAsync(int appointmentId, AppointmentStatus newStatus)
    {
        var appointment = await db.Appointments.FindAsync(appointmentId)
            ?? throw new KeyNotFoundException($"Appointment {appointmentId} not found.");

        if (!ValidTransitions[appointment.Status].Contains(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {appointment.Status} to {newStatus}.");

        var previous = appointment.Status;
        appointment.Status = newStatus;
        await db.SaveChangesAsync();

        logger.LogInformation("Appointment {AppointmentId} status changed from {Previous} to {New}",
            appointmentId, previous, newStatus);
    }
}
