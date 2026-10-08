using FluentValidation;

namespace TitanFitness.Application.Plans.GetPlanById;

public sealed class GetPlanByIdQueryValidator
    : AbstractValidator<GetPlanByIdQuery>
{
    public GetPlanByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);
    }
}