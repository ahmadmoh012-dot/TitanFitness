namespace TitanFitness.Application.Scheduling.GetClassSessions;

public sealed record GetClassSessionsResponse(
    IReadOnlyCollection<ClassSessionListItemResponse> Items,
    int Page,
    int TotalCount);