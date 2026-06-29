using AutoMapper;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Simple entities — property names match DTO constructor params ──

        CreateMap<Branch, BranchDto>();

        CreateMap<ServiceType, ServiceTypeDto>();

        CreateMap<Customer, CustomerDto>();

        // ── Entities with navigations ──

        CreateMap<Mechanic, MechanicDto>()
            .ConstructUsing((s, _) => new MechanicDto(s.Id, s.Name, s.BranchId, s.Branch.Name));

        CreateMap<AppointmentSlot, SlotDto>()
            .ConstructUsing((s, _) => new SlotDto(s.Id, s.MechanicId, s.Mechanic.Name, s.BranchId, s.Branch.Name, s.StartUtc, s.EndUtc));

        CreateMap<WorkNote, WorkNoteDto>()
            .ConstructUsing((s, _) => new WorkNoteDto(s.Id, s.Author.Name, s.Text, s.CreatedUtc));

        // ── Appointment → flattened summary ──

        CreateMap<Appointment, AppointmentSummaryDto>()
            .ConstructUsing((s, _) => new AppointmentSummaryDto(
                s.Id,
                s.ReferenceNumber,
                s.Status.ToString(),
                s.Customer.Name,
                s.Customer.VehicleRegistration,
                s.ServiceType.Name,
                s.Slot.StartUtc,
                s.Mechanic.Name,
                s.Branch.Name));

        // ── Appointment → full detail (nested DTOs resolved via maps above) ──

        CreateMap<Appointment, AppointmentDetailDto>()
            .ConstructUsing((s, ctx) => new AppointmentDetailDto(
                s.Id,
                s.ReferenceNumber,
                s.Status.ToString(),
                s.CreatedUtc,
                ctx.Mapper.Map<CustomerDto>(s.Customer),
                ctx.Mapper.Map<SlotDto>(s.Slot),
                ctx.Mapper.Map<ServiceTypeDto>(s.ServiceType),
                ctx.Mapper.Map<MechanicDto>(s.Mechanic),
                ctx.Mapper.Map<BranchDto>(s.Branch),
                ctx.Mapper.Map<IEnumerable<WorkNoteDto>>(
                    s.WorkNotes.OrderByDescending(n => n.CreatedUtc))));

        // ── MechanicSchedule (service grouping) → schedule group response ──

        CreateMap<MechanicSchedule, ScheduleGroupDto>()
            .ConstructUsing((s, ctx) => new ScheduleGroupDto(
                s.MechanicId,
                s.MechanicName,
                s.BranchName,
                ctx.Mapper.Map<IEnumerable<AppointmentSummaryDto>>(s.Appointments)));

        // ── BookingResult → booking confirmation response ──

        CreateMap<BookingResult, BookAppointmentResponse>()
            .ConstructUsing((s, _) => new BookAppointmentResponse(
                s.Appointment.Id,
                s.Appointment.ReferenceNumber,
                s.Customer.Name,
                s.Customer.VehicleRegistration,
                s.ServiceType.Name,
                s.Slot.Mechanic.Name,
                s.Slot.Branch.Name,
                s.Slot.StartUtc));
    }
}
