using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.GetPlanById;

public sealed record PlanDetailsResponse(
    int Id,
    string Name,
    decimal Price,
    int DurationInMonths,
    int MaximumFreezeDays,
    int MaximumNumberOfFreezes,
    int GuestPassQuota,
    AccessScope AccessScope,
    bool IsPublished,
    int SoldMembershipCount);