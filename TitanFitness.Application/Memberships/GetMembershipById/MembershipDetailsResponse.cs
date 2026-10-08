using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Memberships.GetMembershipById;

public sealed record MembershipDetailsResponse(
    int Id,
    int MemberId,
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