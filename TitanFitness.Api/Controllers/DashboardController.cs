using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Dashboard.GetActiveMembers;
using TitanFitness.Application.Dashboard.GetCheckInsToday;
using TitanFitness.Application.Dashboard.GetUpcomingClasses;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("todays-checkins")]
    public async Task<IActionResult> GetTodaysCheckIns(
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetCheckInsTodayQuery(),
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("current-members")]
    public async Task<IActionResult> GetCurrentMembers(
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetActiveMembersQuery(),
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("next-classes")]
    public async Task<IActionResult> GetNextClasses(
        [FromQuery] int take = 2,
        CancellationToken cancellationToken = default)
    {
        var response = await _mediator.Send(
            new GetUpcomingClassesQuery(take),
            cancellationToken);

        return Ok(response);
    }
}