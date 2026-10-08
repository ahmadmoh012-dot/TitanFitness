using FluentValidation;

namespace TitanFitness.Application.Memberships.GetMembershipById;

public sealed class GetMembershipByIdQueryValidator
    : AbstractValidator<GetMembershipByIdQuery>
{
    public GetMembershipByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);
    }
}