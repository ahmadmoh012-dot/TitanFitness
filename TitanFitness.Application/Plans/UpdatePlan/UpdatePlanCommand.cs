using MediatR;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.UpdatePlan;

public sealed record UpdatePlanCommand(
    int Id,
    string Name,
    decimal Price,
    int DurationInMonths,
    int MaximumFreezeDays,
    int MaximumNumberOfFreezes,
    int GuestPassQuota,
    AccessScope AccessScope,
    bool IsPublished) : IRequest;