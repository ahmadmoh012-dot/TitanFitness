namespace TitanFitness.Application.Members.GetMembers;

public sealed record MemberListItemResponse(
    int Id,
    string MembershipNumber,
    string FullName,
    string? Email,
    string? Phone,
    int HomeBranchId,
    string BranchName,
    string Status,
    DateTime? LastVisit);