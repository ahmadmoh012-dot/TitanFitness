using MediatR;

namespace TitanFitness.Application.Scheduling.GetClassSessions;

public sealed record GetClassSessionsQuery(
    int? BranchId,
    DateOnly SessionDate,
    int Page = 1)
    : IRequest<GetClassSessionsResponse>;