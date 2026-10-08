using FluentValidation;

namespace TitanFitness.Application.Scheduling.GetClassSessionById;

public sealed class GetClassSessionByIdQueryValidator
    : AbstractValidator<GetClassSessionByIdQuery>
{
    public GetClassSessionByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);
    }
}