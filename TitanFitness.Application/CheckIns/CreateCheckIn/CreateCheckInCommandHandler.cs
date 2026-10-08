using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.CheckIns.CreateCheckIn;

public sealed class CreateCheckInCommandHandler
    : IRequestHandler<CreateCheckInCommand, CreateCheckInResponse>
{
    private readonly IReadRepository<Member> _memberReadRepository;
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly IWriteRepository<CheckIn> _checkInWriteRepository;
    private readonly EntryEligibilityChecker _entryEligibilityChecker;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCheckInCommandHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<Branch> branchReadRepository,
        IReadRepository<Membership> membershipReadRepository,
        IWriteRepository<CheckIn> checkInWriteRepository,
        EntryEligibilityChecker entryEligibilityChecker,
        IUnitOfWork unitOfWork)
    {
        _memberReadRepository = memberReadRepository;
        _branchReadRepository = branchReadRepository;
        _membershipReadRepository = membershipReadRepository;
        _checkInWriteRepository = checkInWriteRepository;
        _entryEligibilityChecker = entryEligibilityChecker;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateCheckInResponse> Handle(
        CreateCheckInCommand request,
        CancellationToken cancellationToken)
    {
        var member = await _memberReadRepository.GetByIdAsync(
            request.MemberId,
            cancellationToken
        );

        if (member is null)
        {
            throw new NotFoundException(
                "Member was not found."
            );
        }

        var branchExists = await _branchReadRepository.AnyAsync(
            x => x.Id == request.BranchId,
            cancellationToken
        );

        if (!branchExists)
        {
            throw new NotFoundException(
                "Branch was not found."
            );
        }

        var memberships = await _membershipReadRepository.GetAsync(
            x => x.MemberId == request.MemberId,
            x => x.StartDate,
            true,
            null,
            null,
            cancellationToken
        );

        var now = DateTime.UtcNow;

        var today = DateOnly.FromDateTime(
            now
        );

        var membership =
            memberships
                .FirstOrDefault(x =>
                    x.StartDate <= today &&
                    x.EndDate >= today
                )
            ??
            memberships
                .OrderByDescending(
                    x => x.StartDate
                )
                .FirstOrDefault();

        if (membership is null)
        {
            var refusedCheckIn = new CheckIn(
                request.MemberId,
                request.BranchId,
                now,
                CheckInResult.Refused,
                "No Membership"
            );

            _checkInWriteRepository.Add(
                refusedCheckIn
            );

            await _unitOfWork.SaveChangesAsync(
                cancellationToken
            );

            return new CreateCheckInResponse(
                refusedCheckIn.Id,
                refusedCheckIn.Result,
                refusedCheckIn.RefusalReason
            );
        }

        var eligibility = _entryEligibilityChecker.Check(
            membership,
            member.HomeBranchId,
            request.BranchId,
            today
        );

        var refusalReason =
            eligibility.RefusalReason?.ToString();

        var checkIn = new CheckIn(
            request.MemberId,
            request.BranchId,
            now,
            eligibility.Result,
            refusalReason
        );

        _checkInWriteRepository.Add(
            checkIn
        );

        await _unitOfWork.SaveChangesAsync(
            cancellationToken
        );

        return new CreateCheckInResponse(
            checkIn.Id,
            checkIn.Result,
            checkIn.RefusalReason
        );
    }
}