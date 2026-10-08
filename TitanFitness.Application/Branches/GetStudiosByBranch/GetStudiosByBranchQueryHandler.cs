using MediatR;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;

namespace TitanFitness.Application.Branches.GetStudiosByBranch;

public sealed class GetStudiosByBranchQueryHandler
    : IRequestHandler<GetStudiosByBranchQuery, IReadOnlyCollection<StudioResponse>>
{
    private readonly IReadRepository<Studio> _studioReadRepository;

    public GetStudiosByBranchQueryHandler(
        IReadRepository<Studio> studioReadRepository)
    {
        _studioReadRepository = studioReadRepository;
    }

    public async Task<IReadOnlyCollection<StudioResponse>> Handle(
        GetStudiosByBranchQuery request,
        CancellationToken cancellationToken)
    {
        var studios = await _studioReadRepository.GetAsync(
            x => x.BranchId == request.BranchId,
            x => x.Name,
            false,
            null,
            null,
            cancellationToken);

        return studios
            .Select(x => new StudioResponse(
                x.Id,
                x.Name,
                x.BranchId,
                x.Capacity))
            .ToList();
    }
}