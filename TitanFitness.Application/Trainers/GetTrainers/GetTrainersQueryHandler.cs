using MediatR;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Trainers;

namespace TitanFitness.Application.Trainers.GetTrainers;

public sealed class GetTrainersQueryHandler
    : IRequestHandler<GetTrainersQuery, GetTrainersResponse>
{
    private const int PageSize = 4;

    private readonly IReadRepository<Trainer>
        _trainerReadRepository;

    private readonly IReadRepository<Branch>
        _branchReadRepository;


    public GetTrainersQueryHandler(
        IReadRepository<Trainer> trainerReadRepository,
        IReadRepository<Branch> branchReadRepository)
    {
        _trainerReadRepository =
            trainerReadRepository;

        _branchReadRepository =
            branchReadRepository;
    }


    public async Task<GetTrainersResponse> Handle(
        GetTrainersQuery request,
        CancellationToken cancellationToken)
    {
        var search =
            request.Search?.Trim();


        var trainers =
            await _trainerReadRepository.GetAsync(
                x =>
                    (
                        !request.BranchId.HasValue ||
                        x.BranchId ==
                        request.BranchId.Value
                    )
                    &&
                    (
                        !request.Active.HasValue ||
                        x.IsActive ==
                        request.Active.Value
                    ),
                x => x.Name,
                false,
                null,
                null,
                cancellationToken
            );


        if (trainers.Count == 0)
        {
            return new GetTrainersResponse(
                [],
                request.Page,
                0
            );
        }


        var branchIds =
            trainers
                .Select(
                    x => x.BranchId
                )
                .Distinct()
                .ToList();


        var branches =
            await _branchReadRepository.GetAsync(
                x =>
                    branchIds.Contains(
                        x.Id
                    ),
                x => x.Name,
                false,
                null,
                null,
                cancellationToken
            );


        var branchNames =
            branches.ToDictionary(
                x => x.Id,
                x => x.Name
            );


        var filtered =
            trainers
                .Where(trainer =>
                {
                    if (
                        string.IsNullOrWhiteSpace(
                            search
                        )
                    )
                    {
                        return true;
                    }


                    var branchName =
                        branchNames.TryGetValue(
                            trainer.BranchId,
                            out var name
                        )
                            ? name
                            : "Unknown Branch";


                    var status =
                        trainer.IsActive
                            ? "Active"
                            : "Inactive";


                    return
                        trainer.Name.Contains(
                            search,
                            StringComparison.OrdinalIgnoreCase
                        )
                        ||
                        trainer.TrainerNumber.Contains(
                            search,
                            StringComparison.OrdinalIgnoreCase
                        )
                        ||
                        (
                            trainer.Specialty != null &&
                            trainer.Specialty.Contains(
                                search,
                                StringComparison.OrdinalIgnoreCase
                            )
                        )
                        ||
                        branchName.Contains(
                            search,
                            StringComparison.OrdinalIgnoreCase
                        )
                        ||
                        status.Contains(
                            search,
                            StringComparison.OrdinalIgnoreCase
                        );
                })
                .OrderBy(
                    x => x.Name
                )
                .ToList();


        var totalCount =
            filtered.Count;


        var safePage =
            request.Page < 1
                ? 1
                : request.Page;


        var items =
            filtered
                .Skip(
                    (
                        safePage - 1
                    ) *
                    PageSize
                )
                .Take(
                    PageSize
                )
                .Select(trainer =>
                    new TrainerListItemResponse(
                        trainer.Id,
                        trainer.TrainerNumber,
                        trainer.Name,
                        trainer.Specialty,
                        trainer.BranchId,
                        trainer.Email,
                        trainer.Phone,
                        trainer.IsActive
                    )
                )
                .ToList();


        return new GetTrainersResponse(
            items,
            safePage,
            totalCount
        );
    }
}