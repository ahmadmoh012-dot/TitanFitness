namespace TitanFitness.Application.Members.GetMemberActivity;

public sealed record MemberActivityResponse(
    string Type,
    DateTime OccurredAt,
    string Description);