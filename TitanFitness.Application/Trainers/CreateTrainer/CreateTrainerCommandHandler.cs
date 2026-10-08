using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Trainers;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Trainers.CreateTrainer;

public sealed class CreateTrainerCommandHandler
    : IRequestHandler<CreateTrainerCommand, int>
{
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IWriteRepository<Trainer> _trainerWriteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTrainerCommandHandler(
        IReadRepository<Branch> branchReadRepository,
        IWriteRepository<Trainer> trainerWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _branchReadRepository = branchReadRepository;
        _trainerWriteRepository = trainerWriteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(
        CreateTrainerCommand request,
        CancellationToken cancellationToken)
    {
        var branchExists = await _branchReadRepository.AnyAsync(
            x => x.Id == request.BranchId,
            cancellationToken);

        if (!branchExists)
            throw new NotFoundException("Branch was not found.");

        var trainer = new Trainer(
            request.TrainerNumber,
            request.Name,
            request.Specialty,
            request.BranchId,
            request.Email,
            request.Phone,
            request.IsActive);

        _trainerWriteRepository.Add(trainer);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return trainer.Id;
    }
}