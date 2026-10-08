using FluentValidation;

namespace TitanFitness.Application.Memberships.AddFreeze;

public sealed class AddFreezeCommandValidator
    : AbstractValidator<AddFreezeCommand>
{
    public AddFreezeCommandValidator()
    {
        RuleFor(x => x.MembershipId)
            .GreaterThan(0);

        RuleFor(x => x.StartDate)
            .NotEmpty();

        RuleFor(x => x.DurationInMonths)
            .Must(x => x is 1 or 2 or 3)
            .WithMessage("Duration must be 1, 2, or 3 months.");

        RuleFor(x => x.Reason)
            .IsInEnum();

        RuleFor(x => x.AdditionalNotes)
            .MaximumLength(200);
    }
}