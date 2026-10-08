namespace TitanFitness.Application.Dashboard.GetActiveMembers;

public sealed record GetActiveMembersResponse(
    int Count,
    int CurrentlyInside);