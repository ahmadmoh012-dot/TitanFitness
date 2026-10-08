using MediatR;

namespace TitanFitness.Application.Plans.GetPlans;

public sealed record GetPlansQuery(
    string? Search,
    bool? Published,
    int Page = 1)
    : IRequest<GetPlansResponse>;