using FluentValidation;

namespace TitanFitness.Application.Branches.GetStudiosByBranch;

public sealed class GetStudiosByBranchQueryValidator
    : AbstractValidator<GetStudiosByBranchQuery>
{
    public GetStudiosByBranchQueryValidator()
    {
        RuleFor(x => x.BranchId)
            .GreaterThan(0);
    }
}