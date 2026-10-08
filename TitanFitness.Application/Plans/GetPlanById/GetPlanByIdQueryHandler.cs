using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Plans.GetPlanById;

public sealed class GetPlanByIdQueryHandler
    : IRequestHandler<
        GetPlanByIdQuery,
        PlanDetailsResponse>
{
    private readonly IReadRepository<Plan>
        _planReadRepository;

    private readonly IReadRepository<Membership>
        _membershipReadRepository;

    public GetPlanByIdQueryHandler(
        IReadRepository<Plan> planReadRepository,
        IReadRepository<Membership> membershipReadRepository)
    {
        _planReadRepository =
            planReadRepository;

        _membershipReadRepository =
            membershipReadRepository;
    }

    public async Task<PlanDetailsResponse> Handle(
        GetPlanByIdQuery request,
        CancellationToken cancellationToken)
    {
        var plan =
            await _planReadRepository.GetByIdAsync(
                request.Id,
                cancellationToken);

        if (plan is null)
        {
            throw new NotFoundException(
                "Plan was not found.");
        }

        var soldMembershipCount =
            await _membershipReadRepository.CountAsync(
                membership =>
                    membership.PlanId ==
                    plan.Id,
                cancellationToken);

        return new PlanDetailsResponse(
            plan.Id,
            plan.Name,
            plan.Price,
            plan.DurationInMonths,
            plan.MaximumFreezeDays,
            plan.MaximumNumberOfFreezes,
            plan.GuestPassQuota,
            plan.AccessScope,
            plan.IsPublished,
            soldMembershipCount);
    }
}