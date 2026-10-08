using MediatR;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;

namespace TitanFitness.Application.Branches.GetBranches;

public sealed class GetBranchesQueryHandler
    : IRequestHandler<GetBranchesQuery, IReadOnlyCollection<BranchResponse>>
{
    private readonly IReadRepository<Branch> _branchReadRepository;

    public GetBranchesQueryHandler(
        IReadRepository<Branch> branchReadRepository)
    {
        _branchReadRepository = branchReadRepository;
    }

    public async Task<IReadOnlyCollection<BranchResponse>> Handle(
        GetBranchesQuery request,
        CancellationToken cancellationToken)
    {
        var branches = await _branchReadRepository.GetAsync(
            null,
            x => x.Name,
            false,
            null,
            null,
            cancellationToken);

        return branches
            .Select(x => new BranchResponse(
                x.Id,
                x.Name,
                x.Address,
                x.OpeningTime,
                x.ClosingTime))
            .ToList();
    }
}