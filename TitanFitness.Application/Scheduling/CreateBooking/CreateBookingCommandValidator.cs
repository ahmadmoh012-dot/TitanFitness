using FluentValidation;

namespace TitanFitness.Application.Scheduling.CreateBooking;

public sealed class CreateBookingCommandValidator
    : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.SessionId)
            .GreaterThan(0);

        RuleFor(x => x.MemberId)
            .GreaterThan(0);

        RuleFor(x => x.NotesForTrainer)
            .MaximumLength(500);
    }
}