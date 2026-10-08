using FluentValidation;

namespace TitanFitness.Application.Trainers.UpdateTrainer;

public sealed class UpdateTrainerCommandValidator
    : AbstractValidator<UpdateTrainerCommand>
{
    public UpdateTrainerCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);

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