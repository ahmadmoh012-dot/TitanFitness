using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;

namespace TitanFitness.Application.Members.CreateMember;

public sealed class CreateMemberCommandHandler
    : IRequestHandler<CreateMemberCommand, int>
{
    private readonly IReadRepository<Member> _memberReadRepository;
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IWriteRepository<Member> _memberWriteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMemberCommandHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<Branch> branchReadRepository,
        IWriteRepository<Member> memberWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _memberReadRepository = memberReadRepository;
        _branchReadRepository = branchReadRepository;
        _memberWriteRepository = memberWriteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(
        CreateMemberCommand request,
        CancellationToken cancellationToken)
    {
        var membershipNumber =
            string.IsNullOrWhiteSpace(request.MembershipNumber)
                ? await GenerateMembershipNumberAsync(
                    cancellationToken)
                : request.MembershipNumber.Trim();

        var membershipNumberExists =
            await _memberReadRepository.AnyAsync(
                x =>
                    x.MembershipNumber ==
                    membershipNumber,
                cancellationToken);

        if (membershipNumberExists)
        {
            throw new ConflictException(
                "Membership number already exists.");
        }

        var branchExists =
            await _branchReadRepository.AnyAsync(
                x =>
                    x.Id ==
                    request.HomeBranchId,
                cancellationToken);

        if (!branchExists)
        {
            throw new NotFoundException(
                "Home branch was not found.");
        }

        var member = new Member(
            membershipNumber,
            request.FullName,
            request.Email,
            request.Phone,
            request.Address,
            request.JoinedDate,
            request.Photo,
            request.HomeBranchId);

        _memberWriteRepository.Add(member);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return member.Id;
    }

    private async Task<string>
        GenerateMembershipNumberAsync(
            CancellationToken cancellationToken)
    {
        var latestMembers =
            await _memberReadRepository.GetAsync(
                predicate: null,
                orderBy: x => x.Id,
                orderByDescending: true,
                skip: null,
                take: 1,
                cancellationToken:
                    cancellationToken);

        var nextNumber =
            (latestMembers
                .FirstOrDefault()
                ?.Id ?? 0) + 1;

        while (true)
        {
            var candidate = $"TF-{nextNumber:D4}";

            var exists =
                await _memberReadRepository.AnyAsync(
                    x =>
                        x.MembershipNumber ==
                        candidate,
                    cancellationToken);

            if (!exists)
            {
                return candidate;
            }

            nextNumber++;
        }
    }
}