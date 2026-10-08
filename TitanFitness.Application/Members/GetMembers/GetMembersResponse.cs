namespace TitanFitness.Application.Members.GetMembers;

public sealed record GetMembersResponse(
    IReadOnlyCollection<MemberListItemResponse> Items,
    int Page,
    int TotalCount);