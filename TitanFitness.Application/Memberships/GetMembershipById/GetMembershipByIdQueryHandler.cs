using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.Memberships.GetMembershipById;

public sealed class GetMembershipByIdQueryHandler
    : IRequestHandler<GetMembershipByIdQuery, MembershipDetailsResponse>
{
    private readonly IReadRepository<Membership> _membershipReadRepository;

    public GetMembershipByIdQueryHandler(
        IReadRepository<Membership> membershipReadRepository)
    {
        _membershipReadRepository = membershipReadRepository;
    }

    public async Task<MembershipDetailsResponse> Handle(
        GetMembershipByIdQuery request,
        CancellationToken cancellationToken)
    {
        var membership = await _membershipReadRepository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (membership is null)
            throw new NotFoundException("Membership was not found.");

        return new MembershipDetailsResponse(
            membership.Id,
            membership.MemberId,
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
            membership.AgreedTerms.AccessScope);
    }
}