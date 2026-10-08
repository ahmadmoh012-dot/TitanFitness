namespace TitanFitness.Application.Members.GetMemberProfile;

public sealed record MemberProfileResponse(
    int Id,
    string MembershipNumber,
    string FullName,
    string? Email,
    string? Phone,
    string? Address,
    DateOnly JoinedDate,
    string? PhotoUrl,
    int HomeBranchId,
    string BranchName,
    string Status,
    MemberProfileMembershipResponse? CurrentMembership,
    int FreezesUsed,
    int MaximumFreezes,
    int GuestPassesUsed,
    int GuestPassQuota,
    IReadOnlyCollection<MemberProfileActivityResponse> RecentActivity);

public sealed record MemberProfileMembershipResponse(
    int MembershipId,
    int PlanId,
    string PlanName,
    decimal PricePaid,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status);

public sealed record MemberProfileActivityResponse(
    int Id,
    string Type,
    string Title,
    string? Subtitle,
    DateTime DateTime,
    string? Result);