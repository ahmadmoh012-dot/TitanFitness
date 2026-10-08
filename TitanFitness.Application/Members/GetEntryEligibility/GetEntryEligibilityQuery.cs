using MediatR;

namespace TitanFitness.Application.Members.GetEntryEligibility;

public sealed record GetEntryEligibilityQuery(
    int MemberId,
    int BranchId) : IRequest<EntryEligibilityResponse>;