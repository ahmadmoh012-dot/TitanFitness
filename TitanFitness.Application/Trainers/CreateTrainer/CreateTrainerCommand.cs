using MediatR;

namespace TitanFitness.Application.Trainers.CreateTrainer;

public sealed record CreateTrainerCommand(
    string TrainerNumber,
    string Name,
    string? Specialty,
    int BranchId,
    string? Email,
    string? Phone,
    bool IsActive) : IRequest<int>;