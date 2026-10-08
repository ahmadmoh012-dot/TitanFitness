using MediatR;

namespace TitanFitness.Application.Trainers.UpdateTrainer;

public sealed record UpdateTrainerCommand(
    int Id,
    string Name,
    string? Specialty,
    int BranchId,
    string? Email,
    string? Phone,
    bool IsActive) : IRequest;