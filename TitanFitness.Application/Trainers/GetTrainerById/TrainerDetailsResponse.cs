namespace TitanFitness.Application.Trainers.GetTrainerById;

public sealed record TrainerDetailsResponse(
    int Id,
    string TrainerNumber,
    string Name,
    string? Specialty,
    int BranchId,
    string? Email,
    string? Phone,
    bool IsActive);