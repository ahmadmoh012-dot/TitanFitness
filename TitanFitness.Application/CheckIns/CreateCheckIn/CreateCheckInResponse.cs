using TitanFitness.Domain.CheckIns;

namespace TitanFitness.Application.CheckIns.CreateCheckIn;

public sealed record CreateCheckInResponse(
    int CheckInId,
    CheckInResult Result,
    string? RefusalReason);