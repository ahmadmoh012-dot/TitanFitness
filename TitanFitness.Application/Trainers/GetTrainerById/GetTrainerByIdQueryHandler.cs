using MediatR;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Trainers;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Trainers.GetTrainerById;

public sealed class GetTrainerByIdQueryHandler
    : IRequestHandler<GetTrainerByIdQuery, TrainerDetailsResponse>
{
    private readonly IReadRepository<Trainer> _trainerReadRepository;

    public GetTrainerByIdQueryHandler(
        IReadRepository<Trainer> trainerReadRepository)
    {
        _trainerReadRepository = trainerReadRepository;
    }

    public async Task<TrainerDetailsResponse> Handle(
        GetTrainerByIdQuery request,
        CancellationToken cancellationToken)
    {
        var trainer = await _trainerReadRepository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (trainer is null)
            throw new NotFoundException("Trainer was not found.");

        return new TrainerDetailsResponse(
            trainer.Id,
            trainer.TrainerNumber,
            trainer.Name,
            trainer.Specialty,
            trainer.BranchId,
            trainer.Email,
            trainer.Phone,
            trainer.IsActive);
    }
}