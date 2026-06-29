using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Entities;
using SmrScheduler.Core.Enums;

namespace SmrScheduler.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<ServiceType> ServiceTypes => Set<ServiceType>();
    public DbSet<Mechanic> Mechanics => Set<Mechanic>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<AppointmentSlot> AppointmentSlots => Set<AppointmentSlot>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<WorkNote> WorkNotes => Set<WorkNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasIndex(a => a.ReferenceNumber).IsUnique();
            e.Property(a => a.Status).HasConversion<string>();

            // Avoid multiple cascade paths through Branch
            e.HasOne(a => a.Branch)
             .WithMany(b => b.Appointments)
             .HasForeignKey(a => a.BranchId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.Mechanic)
             .WithMany(m => m.Appointments)
             .HasForeignKey(a => a.MechanicId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.Slot)
             .WithOne(s => s.Appointment)
             .HasForeignKey<Appointment>(a => a.SlotId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AppointmentSlot>(e =>
        {
            e.HasOne(s => s.Branch)
             .WithMany(b => b.AppointmentSlots)
             .HasForeignKey(s => s.BranchId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.Mechanic)
             .WithMany(m => m.AppointmentSlots)
             .HasForeignKey(s => s.MechanicId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WorkNote>(e =>
        {
            e.HasOne(n => n.Author)
             .WithMany(m => m.WorkNotes)
             .HasForeignKey(n => n.AuthorId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
