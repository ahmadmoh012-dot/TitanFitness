using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Members.UpdateMember;

public sealed class UpdateMemberCommandHandler
    : IRequestHandler<UpdateMemberCommand>
{
    private readonly IWriteRepository<Member> _memberWriteRepository;
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMemberCommandHandler(
        IWriteRepository<Member> memberWriteRepository,
        IReadRepository<Branch> branchReadRepository,
        IUnitOfWork unitOfWork)
    {
        _memberWriteRepository = memberWriteRepository;
        _branchReadRepository = branchReadRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(
        UpdateMemberCommand request,
        CancellationToken cancellationToken)
    {
        var member = await _memberWriteRepository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (member is null)
            throw new NotFoundException("Member was not found.");

        var branchExists = await _branchReadRepository.AnyAsync(
            x => x.Id == request.HomeBranchId,
            cancellationToken);

        if (!branchExists)
            throw new NotFoundException("Home branch was not found.");

        member.UpdateProfile(
            request.FullName,
            request.Email,
            request.Phone,
            request.Address,
            request.JoinedDate,
            request.Photo,
            request.HomeBranchId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}