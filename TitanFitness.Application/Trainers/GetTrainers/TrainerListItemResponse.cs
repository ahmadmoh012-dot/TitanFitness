namespace TitanFitness.Application.Trainers.GetTrainers;

public sealed record TrainerListItemResponse(
    int Id,
    string TrainerNumber,
    string Name,
    string? Specialty,
    int BranchId,
    string? Email,
    string? Phone,
    bool IsActive);