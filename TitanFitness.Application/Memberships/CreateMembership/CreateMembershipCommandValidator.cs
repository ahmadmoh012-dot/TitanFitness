using FluentValidation;

namespace TitanFitness.Application.Memberships.CreateMembership;

public sealed class CreateMembershipCommandValidator
    : AbstractValidator<CreateMembershipCommand>
{
    public CreateMembershipCommandValidator()
    {
        RuleFor(x => x.MemberId)
            .GreaterThan(0);

        RuleFor(x => x.PlanId)
            .GreaterThan(0);

        RuleFor(x => x.StartDate)
            .NotEmpty();
    }
}