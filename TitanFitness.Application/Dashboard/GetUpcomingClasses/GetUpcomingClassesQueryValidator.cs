using FluentValidation;

namespace TitanFitness.Application.Dashboard.GetUpcomingClasses;

public sealed class GetUpcomingClassesQueryValidator
    : AbstractValidator<GetUpcomingClassesQuery>
{
    public GetUpcomingClassesQueryValidator()
    {
        RuleFor(x => x.Take)
            .GreaterThan(0);
    }
}