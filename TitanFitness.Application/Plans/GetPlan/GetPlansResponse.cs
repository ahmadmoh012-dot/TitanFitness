namespace TitanFitness.Application.Plans.GetPlans;

public sealed record GetPlansResponse(
    IReadOnlyCollection<PlanListItemResponse> Items,
    int Page,
    int TotalCount);