using FluentValidation;

namespace TitanFitness.Application.Trainers.CreateTrainer;

public sealed class CreateTrainerCommandValidator
    : AbstractValidator<CreateTrainerCommand>
{
    public CreateTrainerCommandValidator()
    {
        RuleFor(x => x.TrainerNumber)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.BranchId)
            .GreaterThan(0);

        RuleFor(x => x.Email)
            .MaximumLength(100);

        RuleFor(x => x.Phone)
            .MaximumLength(20);
    }
}