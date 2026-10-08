using FluentValidation;

namespace TitanFitness.Application.Members.GetMemberActivity;

public sealed class GetMemberActivityQueryValidator
    : AbstractValidator<GetMemberActivityQuery>
{
    public GetMemberActivityQueryValidator()
    {
        RuleFor(x => x.MemberId)
            .GreaterThan(0);

        RuleFor(x => x.Take)
            .GreaterThan(0);
    }
}