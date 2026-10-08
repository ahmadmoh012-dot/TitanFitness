using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Memberships.RenewMembership;

public sealed class RenewMembershipCommandHandler
    : IRequestHandler<RenewMembershipCommand, int>
{
    private readonly IWriteRepository<Membership> _membershipWriteRepository;
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly IReadRepository<Plan> _planReadRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RenewMembershipCommandHandler(
        IWriteRepository<Membership> membershipWriteRepository,
        IReadRepository<Membership> membershipReadRepository,
        IReadRepository<Plan> planReadRepository,
        IUnitOfWork unitOfWork)
    {
        _membershipWriteRepository = membershipWriteRepository;
        _membershipReadRepository = membershipReadRepository;
        _planReadRepository = planReadRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(
        RenewMembershipCommand request,
        CancellationToken cancellationToken)
    {
        var currentMembership = await _membershipWriteRepository.GetByIdAsync(
            request.MembershipId,
            cancellationToken);
        if (currentMembership is null)
            throw new NotFoundException("Membership was not found.");

        currentMembership.EnsureCanBeRenewed();

        var plan = await _planReadRepository.GetByIdAsync(
            currentMembership.PlanId,
            cancellationToken);

        if (plan is null)
            throw new NotFoundException("Plan was not found.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var startDate = currentMembership.EndDate < today
            ? today
            : currentMembership.EndDate.AddDays(1);

        var endDate = startDate.AddMonths(plan.DurationInMonths);

        var hasOverlap = await _membershipReadRepository.AnyAsync(
            x => x.MemberId == currentMembership.MemberId &&
                 x.Id != currentMembership.Id &&
                 x.Status != MembershipStatus.Cancelled &&
                 x.StartDate <= endDate &&
                 x.EndDate >= startDate,
            cancellationToken);

        if (hasOverlap)
        {
            throw new ConflictException(
                "Member already has an overlapping membership.");
        }
        var agreedTerms = new AgreedTerms(
            plan.Price,
            plan.DurationInMonths,
            plan.MaximumFreezeDays,
            plan.MaximumNumberOfFreezes,
            plan.GuestPassQuota,
            plan.AccessScope);

        var status = startDate <= today
            ? MembershipStatus.Active
            : MembershipStatus.Pending;

        var newMembership = new Membership(
            currentMembership.MemberId,
            plan.Id,
            DateTime.UtcNow,
            startDate,
            endDate,
            status,
            agreedTerms);

        _membershipWriteRepository.Add(newMembership);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return newMembership.Id;
    }
}
