using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Members.CreateMember;
using TitanFitness.Application.Members.GetCurrentMembership;
using TitanFitness.Application.Members.GetEntryEligibility;
using TitanFitness.Application.Members.GetMemberActivity;
using TitanFitness.Application.Members.GetMemberById;
using TitanFitness.Application.Members.GetMemberProfile;
using TitanFitness.Application.Members.GetMembers;
using TitanFitness.Application.Members.UpdateMember;
using TitanFitness.Application.Memberships.CreateMembership;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/members")]
public sealed class MembersController
    : ControllerBase
{
    private readonly IMediator _mediator;

    public MembersController(
        IMediator mediator)
    {
        _mediator = mediator;
    }


    [HttpGet]
    public async Task<IActionResult> GetMembers(
        [FromQuery] int? branchId,
        [FromQuery] string? query,
        [FromQuery] int page = 1,
        CancellationToken cancellationToken = default)
    {
        var response =
            await _mediator.Send(
                new GetMembersQuery(
                    branchId,
                    query,
                    page
                ),
                cancellationToken
            );

        return Ok(response);
    }


    [HttpGet("{memberId:int}")]
    public async Task<IActionResult> GetById(
        int memberId,
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetMemberByIdQuery(
                    memberId
                ),
                cancellationToken
            );

        return Ok(response);
    }


    /*
     * Member Profile
     *
     * Required by Angular:
     * GET /api/members/{memberId}/profile
     */
    [HttpGet("{memberId:int}/profile")]
    public async Task<IActionResult> GetProfile(
        int memberId,
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetMemberProfileQuery(
                    memberId
                ),
                cancellationToken
            );

        return Ok(response);
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateMemberCommand command,
        CancellationToken cancellationToken)
    {
        var memberId =
            await _mediator.Send(
                command,
                cancellationToken
            );

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                memberId
            },
            new
            {
                id = memberId
            }
        );
    }


    [HttpPut("{memberId:int}")]
    public async Task<IActionResult> Update(
        int memberId,
        [FromBody] UpdateMemberCommand command,
        CancellationToken cancellationToken)
    {
        var request =
            command with
            {
                Id = memberId
            };

        await _mediator.Send(
            request,
            cancellationToken
        );

        return NoContent();
    }


    /*
     * Sell / create the member's first membership.
     *
     * Used from Member Profile when the member
     * does not currently have a membership.
     */
    [HttpPost("{memberId:int}/membership")]
    public async Task<IActionResult> CreateMembership(
        int memberId,
        [FromBody] CreateMembershipCommand command,
        CancellationToken cancellationToken)
    {
        var request =
            command with
            {
                MemberId = memberId
            };

        var membershipId =
            await _mediator.Send(
                request,
                cancellationToken
            );

        return Created(
            $"/api/memberships/{membershipId}",
            new
            {
                id = membershipId
            }
        );
    }


    [HttpGet("{memberId:int}/recent-activity")]
    public async Task<IActionResult> GetRecentActivity(
        int memberId,
        [FromQuery] int take = 7,
        CancellationToken cancellationToken = default)
    {
        var response =
            await _mediator.Send(
                new GetMemberActivityQuery(
                    memberId,
                    take
                ),
                cancellationToken
            );

        return Ok(response);
    }


    [HttpGet("{memberId:int}/active-membership")]
    public async Task<IActionResult> GetActiveMembership(
        int memberId,
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetCurrentMembershipQuery(
                    memberId
                ),
                cancellationToken
            );

        return Ok(response);
    }


    [HttpGet("{memberId:int}/eligibility")]
    public async Task<IActionResult> GetEligibility(
        int memberId,
        [FromQuery] int branchId,
        CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetEntryEligibilityQuery(
                    memberId,
                    branchId
                ),
                cancellationToken
            );

        return Ok(response);
    }
}