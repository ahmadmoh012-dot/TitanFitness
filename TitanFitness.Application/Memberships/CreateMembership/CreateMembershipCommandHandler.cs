using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Application.Memberships.CreateMembership;

public sealed class CreateMembershipCommandHandler
    : IRequestHandler<CreateMembershipCommand, int>
{
    private readonly IReadRepository<Member>
        _memberReadRepository;

    private readonly IReadRepository<Plan>
        _planReadRepository;

    private readonly IReadRepository<Membership>
        _membershipReadRepository;

    private readonly IWriteRepository<Membership>
        _membershipWriteRepository;

    private readonly IUnitOfWork
        _unitOfWork;


    public CreateMembershipCommandHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<Plan> planReadRepository,
        IReadRepository<Membership> membershipReadRepository,
        IWriteRepository<Membership> membershipWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _memberReadRepository =
            memberReadRepository;

        _planReadRepository =
            planReadRepository;

        _membershipReadRepository =
            membershipReadRepository;

        _membershipWriteRepository =
            membershipWriteRepository;

        _unitOfWork =
            unitOfWork;
    }


    public async Task<int> Handle(
        CreateMembershipCommand request,
        CancellationToken cancellationToken)
    {
        var member =
            await _memberReadRepository
                .GetByIdAsync(
                    request.MemberId,
                    cancellationToken
                );


        if (member is null)
        {
            throw new NotFoundException(
                "Member was not found."
            );
        }


        var plan =
            await _planReadRepository
                .GetByIdAsync(
                    request.PlanId,
                    cancellationToken
                );


        if (plan is null)
        {
            throw new NotFoundException(
                "Plan was not found."
            );
        }


        if (!plan.IsPublished)
        {
            throw new BadRequestException(
                "Only a published plan can be sold."
            );
        }


        var today =
            DateOnly.FromDateTime(
                DateTime.UtcNow
            );


        if (
            request.StartDate <
            today
        )
        {
            throw new BadRequestException(
                "Membership start date cannot be in the past."
            );
        }


        var endDate =
            request.StartDate
                .AddMonths(
                    plan.DurationInMonths
                );


        /*
         * A member must never hold two
         * memberships covering the same day.
         */
        var hasOverlap =
            await _membershipReadRepository
                .AnyAsync(
                    x =>
                        x.MemberId ==
                            request.MemberId &&

                        x.Status !=
                            MembershipStatus.Cancelled &&

                        x.StartDate <=
                            endDate &&

                        x.EndDate >=
                            request.StartDate,

                    cancellationToken
                );


        if (hasOverlap)
        {
            throw new ConflictException(
                "Member already has an overlapping membership."
            );
        }


        /*
         * IMPORTANT BUSINESS RULE:
         * Snapshot the plan terms at purchase.
         */
        var agreedTerms =
            new AgreedTerms(
                plan.Price,
                plan.DurationInMonths,
                plan.MaximumFreezeDays,
                plan.MaximumNumberOfFreezes,
                plan.GuestPassQuota,
                plan.AccessScope
            );


        var status =
            request.StartDate <= today
                ? MembershipStatus.Active
                : MembershipStatus.Pending;


        var membership =
            new Membership(
                request.MemberId,
                plan.Id,
                DateTime.UtcNow,
                request.StartDate,
                endDate,
                status,
                agreedTerms
            );


        _membershipWriteRepository
            .Add(
                membership
            );


        await _unitOfWork
            .SaveChangesAsync(
                cancellationToken
            );


        return membership.Id;
    }
}