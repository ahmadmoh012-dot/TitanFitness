using MediatR;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.CreatePlan;

public sealed record CreatePlanCommand(
    string Name,
    decimal Price,
    int DurationInMonths,
    int MaximumFreezeDays,
    int MaximumNumberOfFreezes,
    int GuestPassQuota,
    AccessScope AccessScope,
    bool IsPublished) : IRequest<int>;