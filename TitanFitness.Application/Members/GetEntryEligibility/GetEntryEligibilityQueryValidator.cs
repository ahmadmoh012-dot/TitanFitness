using FluentValidation;

namespace TitanFitness.Application.Members.GetEntryEligibility;

public sealed class GetEntryEligibilityQueryValidator
    : AbstractValidator<GetEntryEligibilityQuery>
{
    public GetEntryEligibilityQueryValidator()
    {
        RuleFor(x => x.MemberId)
            .GreaterThan(0);

        RuleFor(x => x.BranchId)
            .GreaterThan(0);
    }
}