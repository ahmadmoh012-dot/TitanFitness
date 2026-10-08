using FluentValidation;

namespace TitanFitness.Application.Plans.CreatePlan;

public sealed class CreatePlanCommandValidator
    : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.DurationInMonths)
            .GreaterThan(0);

        RuleFor(x => x.MaximumFreezeDays)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.MaximumNumberOfFreezes)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.GuestPassQuota)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.AccessScope)
            .IsInEnum();
    }
}