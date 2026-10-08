using FluentValidation;

namespace TitanFitness.Application.Members.GetCurrentMembership;

public sealed class GetCurrentMembershipQueryValidator
    : AbstractValidator<GetCurrentMembershipQuery>
{
    public GetCurrentMembershipQueryValidator()
    {
        RuleFor(x => x.MemberId)
            .GreaterThan(0);
    }
}