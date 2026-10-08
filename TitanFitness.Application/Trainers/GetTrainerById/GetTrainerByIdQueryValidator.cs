using FluentValidation;

namespace TitanFitness.Application.Trainers.GetTrainerById;

public sealed class GetTrainerByIdQueryValidator
    : AbstractValidator<GetTrainerByIdQuery>
{
    public GetTrainerByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);
    }
}