using MediatR;

namespace TitanFitness.Application.Trainers.GetTrainers;

public sealed record GetTrainersQuery(
    int? BranchId,
    string? Search,
    bool? Active,
    int Page = 1)
    : IRequest<GetTrainersResponse>;