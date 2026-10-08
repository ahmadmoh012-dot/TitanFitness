using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Memberships.AddFreeze;

public sealed class AddFreezeCommandHandler
    : IRequestHandler<AddFreezeCommand>
{
    private readonly IWriteRepository<Membership> _membershipWriteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddFreezeCommandHandler(
        IWriteRepository<Membership> membershipWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _membershipWriteRepository = membershipWriteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(
        AddFreezeCommand request,
        CancellationToken cancellationToken)
    {
        var membership = await _membershipWriteRepository.GetByIdAsync(
            request.MembershipId,
            cancellationToken);

        if (membership is null)
            throw new NotFoundException("Membership was not found.");

        var requestedOn = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(requestedOn);
            
        membership.AddFreeze(
            request.StartDate,
            request.DurationInMonths,
            request.Reason,
            request.AdditionalNotes,
            requestedOn,
            today);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}