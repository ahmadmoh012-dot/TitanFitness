using FluentValidation;

namespace TitanFitness.Application.Scheduling.GetDaySummary;

public sealed class GetDaySummaryQueryValidator
    : AbstractValidator<GetDaySummaryQuery>
{
    public GetDaySummaryQueryValidator()
    {
        RuleFor(x => x.BranchId)
            .GreaterThan(0)
            .When(x => x.BranchId.HasValue);

        RuleFor(x => x.SessionDate)
            .NotEmpty();
    }
}