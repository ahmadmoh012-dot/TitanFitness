using FluentValidation;

namespace TitanFitness.Application.Trainers.GetTrainers;

public sealed class GetTrainersQueryValidator
    : AbstractValidator<GetTrainersQuery>
{
    public GetTrainersQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.BranchId)
            .GreaterThan(0)
            .When(x => x.BranchId.HasValue);
    }
}