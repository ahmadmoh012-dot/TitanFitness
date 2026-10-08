using FluentValidation;

namespace TitanFitness.Application.Plans.GetPlans;

public sealed class GetPlansQueryValidator
    : AbstractValidator<GetPlansQuery>
{
    public GetPlansQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);
    }
}