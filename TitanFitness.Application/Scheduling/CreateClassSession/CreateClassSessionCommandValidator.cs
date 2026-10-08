using FluentValidation;

namespace TitanFitness.Application.Scheduling.CreateClassSession;

public sealed class CreateClassSessionCommandValidator
    : AbstractValidator<CreateClassSessionCommand>
{
    public CreateClassSessionCommandValidator()
    {
        RuleFor(x => x.ClassName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.BranchId)
            .GreaterThan(0);

        RuleFor(x => x.StudioId)
            .GreaterThan(0);

        RuleFor(x => x.TrainerId)
            .GreaterThan(0);

        RuleFor(x => x.SessionDate)
            .NotEmpty();

        RuleFor(x => x.StartTime)
            .NotEmpty();

        RuleFor(x => x.DurationInMinutes)
            .Must(x => x is 30 or 45 or 60)
            .WithMessage("Duration must be 30, 45, or 60 minutes.");

        RuleFor(x => x.CapacityLimit)
            .GreaterThan(0);

        RuleFor(x => x.Description)
            .MaximumLength(500);
    }
}