using MediatR;

namespace TitanFitness.Application.Branches.GetBranches;

public sealed record GetBranchesQuery
    : IRequest<IReadOnlyCollection<BranchResponse>>;
