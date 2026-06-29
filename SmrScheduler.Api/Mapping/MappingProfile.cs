using AutoMapper;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Simple entities — convention handles identical property names ──

        CreateMap<Branch, BranchDto>();

        CreateMap<ServiceType, ServiceTypeDto>();

        CreateMap<Customer, CustomerDto>();

        // ── Entities with navigations that differ from convention ──

        CreateMap<Mechanic, MechanicDto>()
            .ForCtorParam("branchName", o => o.MapFrom(s => s.Branch.Name));

        CreateMap<AppointmentSlot, SlotDto>()
            .ForCtorParam("mechanicName", o => o.MapFrom(s => s.Mechanic.Name))
            .ForCtorParam("branchName",   o => o.MapFrom(s => s.Branch.Name));

        CreateMap<WorkNote, WorkNoteDto>()
            .ForCtorParam("authorName", o => o.MapFrom(s => s.Author.Name));

        // ── Appointment → flattened summary ──

        CreateMap<Appointment, AppointmentSummaryDto>()
            .ForCtorParam("status",              o => o.MapFrom(s => s.Status.ToString()))
            .ForCtorParam("customerName",        o => o.MapFrom(s => s.Customer.Name))
            .ForCtorParam("vehicleRegistration", o => o.MapFrom(s => s.Customer.VehicleRegistration))
            .ForCtorParam("serviceType",         o => o.MapFrom(s => s.ServiceType.Name))
            .ForCtorParam("startUtc",            o => o.MapFrom(s => s.Slot.StartUtc))
            .ForCtorParam("mechanicName",        o => o.MapFrom(s => s.Mechanic.Name))
            .ForCtorParam("branchName",          o => o.MapFrom(s => s.Branch.Name));

        // ── Appointment → full detail (nested DTOs resolved via maps above) ──

        CreateMap<Appointment, AppointmentDetailDto>()
            .ForCtorParam("status",    o => o.MapFrom(s => s.Status.ToString()))
            .ForCtorParam("customer",  o => o.MapFrom(s => s.Customer))
            .ForCtorParam("slot",      o => o.MapFrom(s => s.Slot))
            .ForCtorParam("serviceType", o => o.MapFrom(s => s.ServiceType))
            .ForCtorParam("mechanic",  o => o.MapFrom(s => s.Mechanic))
            .ForCtorParam("branch",    o => o.MapFrom(s => s.Branch))
            .ForCtorParam("workNotes", o => o.MapFrom(s =>
                s.WorkNotes.OrderByDescending(n => n.CreatedUtc)));

        // ── BookingResult → booking confirmation response ──

        CreateMap<BookingResult, BookAppointmentResponse>()
            .ForCtorParam("id",                  o => o.MapFrom(s => s.Appointment.Id))
            .ForCtorParam("referenceNumber",     o => o.MapFrom(s => s.Appointment.ReferenceNumber))
            .ForCtorParam("customerName",        o => o.MapFrom(s => s.Customer.Name))
            .ForCtorParam("vehicleRegistration", o => o.MapFrom(s => s.Customer.VehicleRegistration))
            .ForCtorParam("serviceType",         o => o.MapFrom(s => s.ServiceType.Name))
            .ForCtorParam("mechanicName",        o => o.MapFrom(s => s.Slot.Mechanic.Name))
            .ForCtorParam("branchName",          o => o.MapFrom(s => s.Slot.Branch.Name))
            .ForCtorParam("startUtc",            o => o.MapFrom(s => s.Slot.StartUtc));
    }
}
