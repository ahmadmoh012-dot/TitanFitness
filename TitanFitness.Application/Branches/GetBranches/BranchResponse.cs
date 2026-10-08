namespace TitanFitness.Application.Branches.GetBranches;

public sealed record BranchResponse(
    int Id,
    string Name,
    string? Address,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime);