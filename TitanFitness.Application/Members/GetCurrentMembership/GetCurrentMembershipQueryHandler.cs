using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.Members.GetCurrentMembership;

public sealed class GetCurrentMembershipQueryHandler
    : IRequestHandler<
        GetCurrentMembershipQuery,
        CurrentMembershipResponse?>
{
    private readonly IReadRepository<Membership>
        _membershipReadRepository;

    public GetCurrentMembershipQueryHandler(
        IReadRepository<Membership>
            membershipReadRepository)
    {
        _membershipReadRepository =
            membershipReadRepository;
    }

    public async Task<CurrentMembershipResponse?> Handle(
        GetCurrentMembershipQuery request,
        CancellationToken cancellationToken)
    {
        var today =
            DateOnly.FromDateTime(
                DateTime.UtcNow
            );

        /*
         * Load the member's memberships.
         *
         * We need more than Active here because
         * Figure 6 allows an expired membership
         * to be renewed onto a different plan.
         */
        var memberships =
            await _membershipReadRepository.GetAsync(
                x =>
                    x.MemberId ==
                    request.MemberId &&
                    x.Status !=
                    MembershipStatus.Cancelled,
                x => x.StartDate,
                true,
                null,
                null,
                cancellationToken
            );


        /*
         * First preference:
         * a membership that is currently active.
         */
        var membership =
            memberships
                .FirstOrDefault(
                    x =>
                        x.Status ==
                        MembershipStatus.Active &&
                        x.StartDate <= today &&
                        x.EndDate >= today
                );


        /*
         * Second preference:
         * the latest expired membership.
         *
         * This is the membership used by
         * Renew Membership / Change Plan.
         */
        membership ??=
            memberships
                .Where(
                    x =>
                        x.Status ==
                        MembershipStatus.Expired ||
                        x.EndDate < today
                )
                .OrderByDescending(
                    x => x.EndDate
                )
                .FirstOrDefault();


        /*
         * Last fallback:
         * a pending/future membership if one
         * exists.
         */
        membership ??=
            memberships
                .OrderByDescending(
                    x => x.StartDate
                )
                .FirstOrDefault();


        if (membership is null)
        {
            throw new NotFoundException(
                "Membership was not found."
            );
        }


        return new CurrentMembershipResponse(
            membership.Id,
            membership.PlanId,
            membership.PurchaseDate,
            membership.StartDate,
            membership.EndDate,
            membership.Status,
            membership.AgreedTerms.PricePaid,
            membership.AgreedTerms.DurationInMonths,
            membership.AgreedTerms.MaximumFreezeDays,
            membership.AgreedTerms.MaximumNumberOfFreezes,
            membership.AgreedTerms.GuestPassQuota,
            membership.AgreedTerms.AccessScope
        );
    }
}