namespace TitanFitness.Application.Branches.GetStudiosByBranch;

public sealed record StudioResponse(
    int Id,
    string Name,
    int BranchId,
    int Capacity);