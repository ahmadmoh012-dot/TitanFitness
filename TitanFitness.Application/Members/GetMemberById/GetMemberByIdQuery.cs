using MediatR;

namespace TitanFitness.Application.Members.GetMemberById;

public sealed record GetMemberByIdQuery(int Id)
    : IRequest<MemberDetailsResponse>;