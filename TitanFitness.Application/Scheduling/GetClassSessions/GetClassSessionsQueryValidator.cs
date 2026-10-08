using FluentValidation;

namespace TitanFitness.Application.Scheduling.GetClassSessions;

public sealed class GetClassSessionsQueryValidator
    : AbstractValidator<GetClassSessionsQuery>
{
    public GetClassSessionsQueryValidator()
    {
        RuleFor(x => x.BranchId)
            .GreaterThan(0)
            .When(x => x.BranchId.HasValue);

        RuleFor(x => x.SessionDate)
            .NotEmpty();

        RuleFor(x => x.Page)
            .GreaterThan(0);
    }
}