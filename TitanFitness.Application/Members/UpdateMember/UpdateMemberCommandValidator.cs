using FluentValidation;

namespace TitanFitness.Application.Members.UpdateMember;

public sealed class UpdateMemberCommandValidator
    : AbstractValidator<UpdateMemberCommand>
{
    public UpdateMemberCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .MaximumLength(100);

        RuleFor(x => x.Phone)
            .MaximumLength(20);

        RuleFor(x => x.Address)
            .MaximumLength(200);

        RuleFor(x => x.JoinedDate)
            .NotEmpty();

        RuleFor(x => x.HomeBranchId)
            .GreaterThan(0);
    }
}