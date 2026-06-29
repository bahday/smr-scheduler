namespace SmrScheduler.Api.DTOs;

public record SlotDto(
    int Id,
    int MechanicId,
    string MechanicName,
    int BranchId,
    string BranchName,
    DateTime StartUtc,
    DateTime EndUtc);
