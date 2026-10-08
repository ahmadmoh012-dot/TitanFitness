using TitanFitness.Domain.CheckIns;

namespace TitanFitness.Application.Members.GetEntryEligibility;

public sealed record EntryEligibilityResponse(
    CheckInResult Result,
    EntryRefusalReason? RefusalReason);