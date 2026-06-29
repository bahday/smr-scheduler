using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Enums;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController(IAppointmentService appointmentService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<BookAppointmentResponse>> BookAppointment(
        [FromBody] BookAppointmentRequest request)
    {
        try
        {
            var result = await appointmentService.BookAsync(new BookAppointmentCommand(
                request.SlotId,
                request.ServiceTypeId,
                request.CustomerName,
                request.CustomerPhone,
                request.VehicleRegistration,
                request.Notes));

            var response = new BookAppointmentResponse(
                result.Appointment.Id,
                result.Appointment.ReferenceNumber,
                result.Customer.Name,
                result.Customer.VehicleRegistration,
                result.ServiceType.Name,
                result.Slot.Mechanic.Name,
                result.Slot.Branch.Name,
                result.Slot.StartUtc);

            return CreatedAtAction(nameof(GetAppointment), new { id = result.Appointment.Id }, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("CONFLICT"))
        {
            return Conflict(new { error = "This slot has already been booked." });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDetailDto>> GetAppointment(int id)
    {
        var appt = await appointmentService.GetByIdAsync(id);
        if (appt is null) return NotFound();

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

        try
        {
            var note = await appointmentService.AddWorkNoteAsync(id, request.Text);
            return CreatedAtAction(nameof(GetAppointment), new { id },
                new WorkNoteDto(note.Id, note.Author.Name, note.Text, note.CreatedUtc));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        if (!Enum.TryParse<AppointmentStatus>(request.Status, ignoreCase: true, out var newStatus))
            return BadRequest(new { error = $"Invalid status '{request.Status}'. Valid: Scheduled, InProgress, Completed, NoShow." });

        try
        {
            await appointmentService.UpdateStatusAsync(id, newStatus);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
