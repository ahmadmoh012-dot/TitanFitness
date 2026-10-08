using MediatR;

namespace TitanFitness.Application.Members.UpdateMember;

public sealed record UpdateMemberCommand(
    int Id,
    string FullName,
    string? Email,
    string? Phone,
    string? Address,
    DateOnly JoinedDate,
    string? Photo,
    int HomeBranchId) : IRequest;