using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Scheduling;
using TitanFitness.Domain.Trainers;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Scheduling.CreateClassSession;

public sealed class CreateClassSessionCommandHandler
    : IRequestHandler<CreateClassSessionCommand, int>
{
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IReadRepository<Studio> _studioReadRepository;
    private readonly IReadRepository<Trainer> _trainerReadRepository;
    private readonly IWriteRepository<ClassSession> _classSessionWriteRepository;
    private readonly ClassSessionScheduler _classSessionScheduler;
    private readonly IUnitOfWork _unitOfWork;

    public CreateClassSessionCommandHandler(
        IReadRepository<Branch> branchReadRepository,
        IReadRepository<Studio> studioReadRepository,
        IReadRepository<Trainer> trainerReadRepository,
        IWriteRepository<ClassSession> classSessionWriteRepository,
        ClassSessionScheduler classSessionScheduler,
        IUnitOfWork unitOfWork)
    {
        _branchReadRepository = branchReadRepository;
        _studioReadRepository = studioReadRepository;
        _trainerReadRepository = trainerReadRepository;
        _classSessionWriteRepository = classSessionWriteRepository;
        _classSessionScheduler = classSessionScheduler;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(
        CreateClassSessionCommand request,
        CancellationToken cancellationToken)
    {
        var branchExists = await _branchReadRepository.AnyAsync(
            x => x.Id == request.BranchId,
            cancellationToken);

        if (!branchExists)
            throw new NotFoundException("Branch was not found.");

        var studio = await _studioReadRepository.GetByIdAsync(
            request.StudioId,
            cancellationToken);

        if (studio is null)
            throw new NotFoundException("Studio was not found.");

        if (studio.BranchId != request.BranchId)
            throw new DomainException(
                "Studio does not belong to the selected branch.");

        var trainer = await _trainerReadRepository.GetByIdAsync(
            request.TrainerId,
            cancellationToken);

        if (trainer is null)
            throw new NotFoundException("Trainer was not found.");

        if (!trainer.IsActive)
            throw new DomainException(
                "Trainer is not active.");

        if (trainer.BranchId != request.BranchId)
            throw new DomainException(
                "Trainer does not belong to the selected branch.");

        var session = await _classSessionScheduler.ScheduleAsync(
            request.ClassName,
            request.BranchId,
            request.StudioId,
            request.TrainerId,
            request.SessionDate,
            request.StartTime,
            request.DurationInMinutes,
            request.CapacityLimit,
            studio.Capacity,
            request.Description,
            cancellationToken);

        _classSessionWriteRepository.Add(session);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return session.Id;
    }
}