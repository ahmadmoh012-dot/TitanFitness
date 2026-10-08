using MediatR;

namespace TitanFitness.Application.Branches.GetStudiosByBranch;

public sealed record GetStudiosByBranchQuery(int BranchId)
    : IRequest<IReadOnlyCollection<StudioResponse>>;