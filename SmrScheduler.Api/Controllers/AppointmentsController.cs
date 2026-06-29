using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Enums;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController(IAppointmentService appointmentService, IMapper mapper) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<BookAppointmentResponse>> BookAppointment(
        [FromBody] BookAppointmentRequest request)
    {
        var result = await appointmentService.BookAsync(new BookAppointmentCommand(
            request.SlotId,
            request.ServiceTypeId,
            request.CustomerName,
            request.CustomerPhone,
            request.VehicleRegistration,
            request.Notes));

        var response = mapper.Map<BookAppointmentResponse>(result);
        return CreatedAtAction(nameof(GetAppointment), new { id = result.Appointment.Id }, response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDetailDto>> GetAppointment(int id)
    {
        var appt = await appointmentService.GetByIdAsync(id);
        if (appt is null) return NotFound();

        return Ok(mapper.Map<AppointmentDetailDto>(appt));
    }

    [HttpPost("{id:int}/notes")]
    public async Task<ActionResult<WorkNoteDto>> AddWorkNote(int id, [FromBody] AddWorkNoteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { error = "Note text cannot be empty." });

        var note = await appointmentService.AddWorkNoteAsync(id, request.Text);
        return CreatedAtAction(nameof(GetAppointment), new { id },
            mapper.Map<WorkNoteDto>(note));
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        if (!Enum.TryParse<AppointmentStatus>(request.Status, ignoreCase: true, out var newStatus))
            return BadRequest(new { error = $"Invalid status '{request.Status}'. Valid: Scheduled, InProgress, Completed, NoShow." });

        await appointmentService.UpdateStatusAsync(id, newStatus);
        return NoContent();
    }
}
