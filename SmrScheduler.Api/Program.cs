using Microsoft.EntityFrameworkCore;
using SmrScheduler.Core.Interfaces;
using SmrScheduler.Infrastructure.Data;
using SmrScheduler.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (connStr.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase)
        || connStr.EndsWith(".db", StringComparison.OrdinalIgnoreCase))
        options.UseSqlite(connStr);
    else
        options.UseSqlServer(connStr);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddScoped<IReferenceDataService, ReferenceDataService>();
builder.Services.AddScoped<ISlotService, SlotService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IMechanicService, MechanicService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-migrate and seed on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitialiser.InitialiseAsync(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

app.Run();
