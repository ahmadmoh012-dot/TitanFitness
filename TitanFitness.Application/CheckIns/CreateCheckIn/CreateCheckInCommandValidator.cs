using FluentValidation;

namespace TitanFitness.Application.CheckIns.CreateCheckIn;

public sealed class CreateCheckInCommandValidator
    : AbstractValidator<CreateCheckInCommand>
{
    public CreateCheckInCommandValidator()
    {
        RuleFor(x => x.MemberId)
            .GreaterThan(0);

        RuleFor(x => x.BranchId)
            .GreaterThan(0);
    }
}