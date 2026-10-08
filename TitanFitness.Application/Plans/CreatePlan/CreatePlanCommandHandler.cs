using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Common.Repositories;

using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.CreatePlan;

public sealed class CreatePlanCommandHandler
    : IRequestHandler<CreatePlanCommand, int>
{
    private readonly IWriteRepository<Plan> _planWriteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePlanCommandHandler(
        IWriteRepository<Plan> planWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _planWriteRepository = planWriteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(
        CreatePlanCommand request,
        CancellationToken cancellationToken)
    {
        var plan = new Plan(
            request.Name,
            request.Price,
            request.DurationInMonths,
            request.MaximumFreezeDays,
            request.MaximumNumberOfFreezes,
            request.GuestPassQuota,
            request.AccessScope,
            request.IsPublished);

        _planWriteRepository.Add(plan);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return plan.Id;
    }
}