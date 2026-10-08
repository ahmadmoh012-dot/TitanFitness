using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Memberships.ChangePlan;

public sealed class ChangePlanCommandHandler
    : IRequestHandler<ChangePlanCommand, int>
{
    private readonly IWriteRepository<Membership> _membershipWriteRepository;
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly IReadRepository<Plan> _planReadRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ChangePlanCommandHandler(
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
        ChangePlanCommand request,
        CancellationToken cancellationToken)
    {
        var currentMembership = await _membershipWriteRepository.GetByIdAsync(
            request.MembershipId,
            cancellationToken);



        if (currentMembership is null)
            throw new NotFoundException("Membership was not found.");

        if (currentMembership.Status == MembershipStatus.Cancelled)
            throw new BadRequestException(
                "Cancelled membership cannot change plan.");


        var newPlan = await _planReadRepository.GetByIdAsync(
            request.NewPlanId,
            cancellationToken);

        if (newPlan is null)
            throw new NotFoundException("Plan was not found.");

        if (!newPlan.IsPublished)
            throw new BadRequestException("Plan is not published.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var startDate = request.ApplyImmediately
            ? today
            : currentMembership.EndDate.AddDays(1);

        var endDate = startDate.AddMonths(newPlan.DurationInMonths);

        var hasOverlap = await _membershipReadRepository.AnyAsync(
            x => x.MemberId == currentMembership.MemberId &&
                 x.Id != currentMembership.Id &&
                 x.Status != MembershipStatus.Cancelled &&
                 x.StartDate <= endDate &&
                 x.EndDate >= startDate,
            cancellationToken);
        if (hasOverlap)
            throw new ConflictException
                ("Member already has an overlapping membership.");
        if (request.ApplyImmediately)
            currentMembership.Cancel();

        var agreedTerms = new AgreedTerms(
            newPlan.Price,
            newPlan.DurationInMonths,
            newPlan.MaximumFreezeDays,
            newPlan.MaximumNumberOfFreezes,
            newPlan.GuestPassQuota,
            newPlan.AccessScope);

        var status = request.ApplyImmediately
            ? MembershipStatus.Active
            : MembershipStatus.Pending;

        var newMembership = new Membership(
            currentMembership.MemberId,
            newPlan.Id,
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