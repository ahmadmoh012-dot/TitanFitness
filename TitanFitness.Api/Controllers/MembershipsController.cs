using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Memberships.AddFreeze;
using TitanFitness.Application.Memberships.ChangePlan;
using TitanFitness.Application.Memberships.GetMembershipById;
using TitanFitness.Application.Memberships.RenewMembership;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/memberships")]
public sealed class MembershipsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MembershipsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{membershipId:int}")]
    public async Task<IActionResult> GetById(
        int membershipId,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetMembershipByIdQuery(membershipId),
            cancellationToken);

        return Ok(response);
    }

    [HttpPost("{membershipId:int}/renewal")]
    public async Task<IActionResult> Renew(
        int membershipId,
        CancellationToken cancellationToken)
    {
        var newMembershipId = await _mediator.Send(
            new RenewMembershipCommand(membershipId),
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { membershipId = newMembershipId },
            new { id = newMembershipId });
    }

    [HttpPost("{membershipId:int}/switch-plan")]
    public async Task<IActionResult> SwitchPlan(
        int membershipId,
        [FromBody] ChangePlanCommand command,
        CancellationToken cancellationToken)
    {
        var request = command with
        {
            MembershipId = membershipId
        };

        var newMembershipId = await _mediator.Send(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { membershipId = newMembershipId },
            new { id = newMembershipId });
    }

    [HttpPost("{membershipId:int}/freeze")]
    public async Task<IActionResult> Freeze(
        int membershipId,
        [FromBody] AddFreezeCommand command,
        CancellationToken cancellationToken)
    {
        var request = command with
        {
            MembershipId = membershipId
        };

        await _mediator.Send(
            request,
            cancellationToken);

        return NoContent();
    }
}