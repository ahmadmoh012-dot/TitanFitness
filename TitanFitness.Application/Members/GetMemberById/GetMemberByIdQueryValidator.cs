using FluentValidation;

namespace TitanFitness.Application.Members.GetMemberById;

public sealed class GetMemberByIdQueryValidator
    : AbstractValidator<GetMemberByIdQuery>
{
    public GetMemberByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);
    }
}