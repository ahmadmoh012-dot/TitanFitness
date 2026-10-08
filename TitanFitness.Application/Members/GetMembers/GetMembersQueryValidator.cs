using FluentValidation;

namespace TitanFitness.Application.Members.GetMembers;

public sealed class GetMembersQueryValidator
    : AbstractValidator<GetMembersQuery>
{
    public GetMembersQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.BranchId)
            .GreaterThan(0)
            .When(x => x.BranchId.HasValue);
    }
}