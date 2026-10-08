using MediatR;

namespace TitanFitness.Application.Scheduling.GetDaySummary;

public sealed record GetDaySummaryQuery(
    int? BranchId,
    DateOnly SessionDate)
    : IRequest<DaySummaryResponse>;