using AutoMapper;
using SmrScheduler.Api.DTOs;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Interfaces;

namespace SmrScheduler.Api.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Simple entity → DTO (convention handles identical property names) ──

        CreateMap<Branch, BranchDto>();

        CreateMap<ServiceType, ServiceTypeDto>();

        CreateMap<Customer, CustomerDto>();

        // ── Entities with navigations that don't match by convention ──

        CreateMap<Mechanic, MechanicDto>()
            .ForMember(d => d.BranchName, o => o.MapFrom(s => s.Branch.Name));

        CreateMap<AppointmentSlot, SlotDto>()
            .ForMember(d => d.MechanicName, o => o.MapFrom(s => s.Mechanic.Name))
            .ForMember(d => d.BranchName,   o => o.MapFrom(s => s.Branch.Name));

        CreateMap<WorkNote, WorkNoteDto>()
            .ForMember(d => d.AuthorName, o => o.MapFrom(s => s.Author.Name));

        // ── Appointment → flattened summary ──

        CreateMap<Appointment, AppointmentSummaryDto>()
            .ForMember(d => d.Status,              o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.CustomerName,        o => o.MapFrom(s => s.Customer.Name))
            .ForMember(d => d.VehicleRegistration, o => o.MapFrom(s => s.Customer.VehicleRegistration))
            .ForMember(d => d.ServiceType,         o => o.MapFrom(s => s.ServiceType.Name))
            .ForMember(d => d.StartUtc,            o => o.MapFrom(s => s.Slot.StartUtc))
            .ForMember(d => d.MechanicName,        o => o.MapFrom(s => s.Mechanic.Name))
            .ForMember(d => d.BranchName,          o => o.MapFrom(s => s.Branch.Name));

        // ── Appointment → full detail (nested DTOs resolved via configured maps above) ──

        CreateMap<Appointment, AppointmentDetailDto>()
            .ForMember(d => d.Status,    o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.WorkNotes, o => o.MapFrom(s =>
                s.WorkNotes.OrderByDescending(n => n.CreatedUtc)));

        // ── BookingResult (service return value) → booking confirmation response ──

        CreateMap<BookingResult, BookAppointmentResponse>()
            .ForMember(d => d.Id,                  o => o.MapFrom(s => s.Appointment.Id))
            .ForMember(d => d.ReferenceNumber,     o => o.MapFrom(s => s.Appointment.ReferenceNumber))
            .ForMember(d => d.CustomerName,        o => o.MapFrom(s => s.Customer.Name))
            .ForMember(d => d.VehicleRegistration, o => o.MapFrom(s => s.Customer.VehicleRegistration))
            .ForMember(d => d.ServiceType,         o => o.MapFrom(s => s.ServiceType.Name))
            .ForMember(d => d.MechanicName,        o => o.MapFrom(s => s.Slot.Mechanic.Name))
            .ForMember(d => d.BranchName,          o => o.MapFrom(s => s.Slot.Branch.Name))
            .ForMember(d => d.StartUtc,            o => o.MapFrom(s => s.Slot.StartUtc));
    }
}
