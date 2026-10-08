using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Plans;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Plans.UpdatePlan;

public sealed class UpdatePlanCommandHandler
    : IRequestHandler<UpdatePlanCommand>
{
    private readonly IWriteRepository<Plan> _planWriteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePlanCommandHandler(
        IWriteRepository<Plan> planWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _planWriteRepository = planWriteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(
        UpdatePlanCommand request,
        CancellationToken cancellationToken)
    {
        var plan = await _planWriteRepository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (plan is null)
            throw new NotFoundException("Plan was not found.");

        plan.Update(
            request.Name,
            request.Price,
            request.DurationInMonths,
            request.MaximumFreezeDays,
            request.MaximumNumberOfFreezes,
            request.GuestPassQuota,
            request.AccessScope,
            request.IsPublished);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}