using MediatR;

namespace TitanFitness.Application.CheckIns.CreateCheckIn;

public sealed record CreateCheckInCommand(
    int MemberId,
    int BranchId) : IRequest<CreateCheckInResponse>;