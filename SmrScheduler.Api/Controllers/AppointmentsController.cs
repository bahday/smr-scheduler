using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Enums;
using SmrScheduler.Infrastructure.Data;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<BookAppointmentResponse>> BookAppointment(
        [FromBody] BookAppointmentRequest request)
    {
        // Pessimistic double-booking guard: lock and check in one transaction
        await using var transaction = await db.Database.BeginTransactionAsync();

        var slot = await db.AppointmentSlots
            .Include(s => s.Mechanic)
            .Include(s => s.Branch)
            .FirstOrDefaultAsync(s => s.Id == request.SlotId);

        if (slot is null)
            return NotFound(new { error = "Slot not found." });

        if (!slot.IsAvailable)
            return Conflict(new { error = "This slot has already been booked." });

        var serviceType = await db.ServiceTypes.FindAsync(request.ServiceTypeId);
        if (serviceType is null)
            return NotFound(new { error = "Service type not found." });

        var customer = new Customer
        {
            Name = request.CustomerName,
            Phone = request.CustomerPhone,
            VehicleRegistration = request.VehicleRegistration
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        // Generate sequential reference number for today
        var today = DateTime.UtcNow.Date;
        var dateStr = today.ToString("yyyyMMdd");
        var todayCount = await db.Appointments
            .CountAsync(a => a.CreatedUtc >= today && a.CreatedUtc < today.AddDays(1));
        var refNumber = $"AA-{dateStr}-{(todayCount + 1):D3}";

        slot.IsAvailable = false;

        var appointment = new Appointment
        {
            ReferenceNumber = refNumber,
            SlotId = slot.Id,
            CustomerId = customer.Id,
            ServiceTypeId = serviceType.Id,
            BranchId = slot.BranchId,
            MechanicId = slot.MechanicId,
            Status = AppointmentStatus.Scheduled,
            CreatedUtc = DateTime.UtcNow
        };
        db.Appointments.Add(appointment);
        await db.SaveChangesAsync();

        // Add customer notes as first work note if provided
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            db.WorkNotes.Add(new WorkNote
            {
                AppointmentId = appointment.Id,
                AuthorId = slot.MechanicId,
                Text = $"Customer notes: {request.Notes}",
                CreatedUtc = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }

        await transaction.CommitAsync();

        return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id },
            new BookAppointmentResponse(
                appointment.Id,
                appointment.ReferenceNumber,
                customer.Name,
                customer.VehicleRegistration,
                serviceType.Name,
                slot.Mechanic.Name,
                slot.Branch.Name,
                slot.StartUtc));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDetailDto>> GetAppointment(int id)
    {
        var appt = await db.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Slot).ThenInclude(s => s.Branch)
            .Include(a => a.ServiceType)
            .Include(a => a.Mechanic).ThenInclude(m => m.Branch)
            .Include(a => a.Branch)
            .Include(a => a.WorkNotes).ThenInclude(n => n.Author)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appt is null)
            return NotFound();

        return Ok(new AppointmentDetailDto(
            appt.Id,
            appt.ReferenceNumber,
            appt.Status.ToString(),
            appt.CreatedUtc,
            new CustomerDto(appt.Customer.Id, appt.Customer.Name, appt.Customer.Phone, appt.Customer.VehicleRegistration),
            new SlotDto(appt.Slot.Id, appt.Slot.MechanicId, appt.Mechanic.Name, appt.Slot.BranchId, appt.Branch.Name, appt.Slot.StartUtc, appt.Slot.EndUtc),
            new ServiceTypeDto(appt.ServiceType.Id, appt.ServiceType.Name, appt.ServiceType.DurationMinutes),
            new MechanicDto(appt.Mechanic.Id, appt.Mechanic.Name, appt.Mechanic.BranchId, appt.Mechanic.Branch.Name),
            new BranchDto(appt.Branch.Id, appt.Branch.Name, appt.Branch.Address),
            appt.WorkNotes
                .OrderByDescending(n => n.CreatedUtc)
                .Select(n => new WorkNoteDto(n.Id, n.Author.Name, n.Text, n.CreatedUtc))));
    }

    [HttpPost("{id:int}/notes")]
    public async Task<ActionResult<WorkNoteDto>> AddWorkNote(int id, [FromBody] AddWorkNoteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { error = "Note text cannot be empty." });

        var appt = await db.Appointments.FindAsync(id);
        if (appt is null)
            return NotFound();

        var note = new WorkNote
        {
            AppointmentId = id,
            AuthorId = appt.MechanicId,
            Text = request.Text,
            CreatedUtc = DateTime.UtcNow
        };
        db.WorkNotes.Add(note);
        await db.SaveChangesAsync();

        var mechanic = await db.Mechanics.FindAsync(note.AuthorId);
        return CreatedAtAction(nameof(GetAppointment), new { id },
            new WorkNoteDto(note.Id, mechanic!.Name, note.Text, note.CreatedUtc));
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        if (!Enum.TryParse<AppointmentStatus>(request.Status, ignoreCase: true, out var newStatus))
            return BadRequest(new { error = $"Invalid status '{request.Status}'. Valid values: Scheduled, InProgress, Completed, NoShow." });

        var appt = await db.Appointments.FindAsync(id);
        if (appt is null)
            return NotFound();

        // Validate transition
        var validTransitions = new Dictionary<AppointmentStatus, AppointmentStatus[]>
        {
            [AppointmentStatus.Scheduled]  = [AppointmentStatus.InProgress, AppointmentStatus.NoShow],
            [AppointmentStatus.InProgress] = [AppointmentStatus.Completed],
            [AppointmentStatus.Completed]  = [],
            [AppointmentStatus.NoShow]     = []
        };

        if (!validTransitions[appt.Status].Contains(newStatus))
            return BadRequest(new { error = $"Cannot transition from {appt.Status} to {newStatus}." });

        appt.Status = newStatus;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
