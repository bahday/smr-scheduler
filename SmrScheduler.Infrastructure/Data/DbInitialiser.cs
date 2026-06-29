using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Enums;

namespace SmrScheduler.Infrastructure.Data;

public static class DbInitialiser
{
    public static async Task InitialiseAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.Branches.AnyAsync())
            return;

        // --- Branches ---
        var dublin = new Branch { Name = "Dublin HQ", Address = "Fumbally Lane, Dublin 8, D08 K294" };
        var cork = new Branch { Name = "Cork Branch", Address = "Tramore Road, Cork, T12 X8YA" };
        context.Branches.AddRange(dublin, cork);

        // --- Service Types ---
        var inspection = new ServiceType { Name = "Inspection", DurationMinutes = 60 };
        var service = new ServiceType { Name = "Service", DurationMinutes = 120 };
        var repair = new ServiceType { Name = "Repair", DurationMinutes = 90 };
        var diagnostics = new ServiceType { Name = "Diagnostics", DurationMinutes = 60 };
        context.ServiceTypes.AddRange(inspection, service, repair, diagnostics);

        await context.SaveChangesAsync();

        // --- Mechanics ---
        var liam = new Mechanic { Name = "Liam Murphy", BranchId = dublin.Id };
        var aoife = new Mechanic { Name = "Aoife Kelly", BranchId = dublin.Id };
        var cormac = new Mechanic { Name = "Cormac O'Brien", BranchId = cork.Id };
        var sinead = new Mechanic { Name = "Sinéad Walsh", BranchId = cork.Id };
        context.Mechanics.AddRange(liam, aoife, cormac, sinead);

        await context.SaveChangesAsync();

        // --- Appointment Slots: next 7 weekdays, 08:00–17:00 hourly per mechanic ---
        var mechanics = new[] { liam, aoife, cormac, sinead };
        var slots = new List<AppointmentSlot>();
        var today = DateTime.UtcNow.Date;
        var daysAdded = 0;
        var current = today;

        while (daysAdded < 7)
        {
            if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
            {
                foreach (var mechanic in mechanics)
                {
                    for (var hour = 8; hour < 17; hour++)
                    {
                        slots.Add(new AppointmentSlot
                        {
                            MechanicId = mechanic.Id,
                            BranchId = mechanic.BranchId,
                            StartUtc = current.AddHours(hour),
                            EndUtc = current.AddHours(hour + 1),
                            IsAvailable = true
                        });
                    }
                }
                daysAdded++;
            }
            current = current.AddDays(1);
        }

        context.AppointmentSlots.AddRange(slots);
        await context.SaveChangesAsync();

        // --- Sample Customers ---
        var customer1 = new Customer { Name = "Patrick Byrne", Phone = "087-123-4567", VehicleRegistration = "191-D-12345" };
        var customer2 = new Customer { Name = "Niamh Connolly", Phone = "086-234-5678", VehicleRegistration = "201-C-67890" };
        var customer3 = new Customer { Name = "Declan Farrell", Phone = "085-345-6789", VehicleRegistration = "221-D-54321" };
        context.Customers.AddRange(customer1, customer2, customer3);
        await context.SaveChangesAsync();

        // --- 3 sample appointments (today's slots) ---
        var todaySlots = slots.Where(s => s.StartUtc.Date == today).ToList();

        var slot1 = todaySlots.First(s => s.MechanicId == liam.Id && s.StartUtc.Hour == 9);
        var slot2 = todaySlots.First(s => s.MechanicId == aoife.Id && s.StartUtc.Hour == 10);
        var slot3 = todaySlots.First(s => s.MechanicId == cormac.Id && s.StartUtc.Hour == 11);

        slot1.IsAvailable = false;
        slot2.IsAvailable = false;
        slot3.IsAvailable = false;

        var dateStr = today.ToString("yyyyMMdd");

        var appt1 = new Appointment
        {
            ReferenceNumber = $"AA-{dateStr}-001",
            SlotId = slot1.Id,
            CustomerId = customer1.Id,
            ServiceTypeId = inspection.Id,
            BranchId = dublin.Id,
            MechanicId = liam.Id,
            Status = AppointmentStatus.Completed,
            CreatedUtc = DateTime.UtcNow.AddHours(-3)
        };

        var appt2 = new Appointment
        {
            ReferenceNumber = $"AA-{dateStr}-002",
            SlotId = slot2.Id,
            CustomerId = customer2.Id,
            ServiceTypeId = service.Id,
            BranchId = dublin.Id,
            MechanicId = aoife.Id,
            Status = AppointmentStatus.InProgress,
            CreatedUtc = DateTime.UtcNow.AddHours(-1)
        };

        var appt3 = new Appointment
        {
            ReferenceNumber = $"AA-{dateStr}-003",
            SlotId = slot3.Id,
            CustomerId = customer3.Id,
            ServiceTypeId = repair.Id,
            BranchId = cork.Id,
            MechanicId = cormac.Id,
            Status = AppointmentStatus.Scheduled,
            CreatedUtc = DateTime.UtcNow.AddMinutes(-30)
        };

        context.Appointments.AddRange(appt1, appt2, appt3);
        await context.SaveChangesAsync();

        // --- Sample work notes on completed appointment ---
        context.WorkNotes.Add(new WorkNote
        {
            AppointmentId = appt1.Id,
            AuthorId = liam.Id,
            Text = "Full inspection completed. Brake pads at 30% — advised customer to replace within 3 months. Tyre tread within limits.",
            CreatedUtc = DateTime.UtcNow.AddHours(-2)
        });
        context.WorkNotes.Add(new WorkNote
        {
            AppointmentId = appt2.Id,
            AuthorId = aoife.Id,
            Text = "Oil and filter changed. Air filter replaced. Noticed minor oil seep at rocker cover — monitoring.",
            CreatedUtc = DateTime.UtcNow.AddMinutes(-45)
        });

        await context.SaveChangesAsync();
    }
}
