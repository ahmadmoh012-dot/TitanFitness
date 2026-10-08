using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Members.GetCurrentMembership;

public sealed record CurrentMembershipResponse(
    int Id,
    int PlanId,
    DateTime PurchaseDate,
    DateOnly StartDate,
    DateOnly EndDate,
    MembershipStatus Status,
    decimal PricePaid,
    int DurationInMonths,
    int MaximumFreezeDays,
    int MaximumNumberOfFreezes,
    int GuestPassQuota,
    AccessScope AccessScope);