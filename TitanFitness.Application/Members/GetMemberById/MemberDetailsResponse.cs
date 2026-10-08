namespace TitanFitness.Application.Members.GetMemberById;

public sealed record MemberDetailsResponse(
    int Id,
    string MembershipNumber,
    string FullName,
    string? Email,
    string? Phone,
    string? Address,
    DateOnly JoinedDate,
    string? Photo,
    int HomeBranchId);