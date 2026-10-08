using FluentValidation;

namespace TitanFitness.Application.Members.GetMemberProfile;

public sealed class GetMemberProfileQueryValidator
    : AbstractValidator<GetMemberProfileQuery>
{
    public GetMemberProfileQueryValidator()
    {
        RuleFor(x => x.MemberId)
            .GreaterThan(0);
    }
}