using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Trainers;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Trainers.UpdateTrainer;

public sealed class UpdateTrainerCommandHandler
    : IRequestHandler<UpdateTrainerCommand>
{
    private readonly IWriteRepository<Trainer> _trainerWriteRepository;
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTrainerCommandHandler(
        IWriteRepository<Trainer> trainerWriteRepository,
        IReadRepository<Branch> branchReadRepository,
        IUnitOfWork unitOfWork)
    {
        _trainerWriteRepository = trainerWriteRepository;
        _branchReadRepository = branchReadRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(
        UpdateTrainerCommand request,
        CancellationToken cancellationToken)
    {
        var trainer = await _trainerWriteRepository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (trainer is null)
            throw new NotFoundException("Trainer was not found.");

        var branchExists = await _branchReadRepository.AnyAsync(
            x => x.Id == request.BranchId,
            cancellationToken);

        if (!branchExists)
            throw new NotFoundException("Branch was not found.");

        trainer.Update(
            request.Name,
            request.Specialty,
            request.BranchId,
            request.Email,
            request.Phone,
            request.IsActive);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}