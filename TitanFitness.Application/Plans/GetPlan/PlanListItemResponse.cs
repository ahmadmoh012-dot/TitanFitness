using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.GetPlans;

public sealed record PlanListItemResponse(
    int Id,
    string Name,
    decimal Price,
    int DurationInMonths,
    int MaximumFreezeDays,
    int MaximumNumberOfFreezes,
    int GuestPassQuota,
    AccessScope AccessScope,
    bool IsPublished);