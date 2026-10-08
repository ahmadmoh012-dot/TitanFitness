using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Scheduling.CreateClassSession;
using TitanFitness.Application.Scheduling.GetClassSessionById;
using TitanFitness.Application.Scheduling.GetClassSessions;
using TitanFitness.Application.Scheduling.GetDaySummary;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/class-sessions")]
public sealed class ClassSessionsController
    : ControllerBase
{
    private readonly IMediator _mediator;

    public ClassSessionsController(
        IMediator mediator)
    {
        _mediator =
            mediator;
    }

    [HttpGet]
    public async Task<IActionResult>
        GetClassSessions(
            [FromQuery] int? branchId,
            [FromQuery] DateOnly date,
            [FromQuery] int page = 1,
            CancellationToken cancellationToken = default)
    {
        var response =
            await _mediator.Send(
                new GetClassSessionsQuery(
                    branchId,
                    date,
                    page),
                cancellationToken);

        return Ok(
            response);
    }

    [HttpGet("daily-summary")]
    public async Task<IActionResult>
        GetDailySummary(
            [FromQuery] int? branchId,
            [FromQuery] DateOnly date,
            CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetDaySummaryQuery(
                    branchId,
                    date),
                cancellationToken);

        return Ok(
            response);
    }

    [HttpGet("{sessionId:int}")]
    public async Task<IActionResult>
        GetById(
            int sessionId,
            CancellationToken cancellationToken)
    {
        var response =
            await _mediator.Send(
                new GetClassSessionByIdQuery(
                    sessionId),
                cancellationToken);

        return Ok(
            response);
    }

    [HttpPost]
    public async Task<IActionResult>
        Create(
            [FromBody]
            CreateClassSessionCommand command,
            CancellationToken cancellationToken)
    {
        var sessionId =
            await _mediator.Send(
                command,
                cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                sessionId
            },
            new
            {
                id = sessionId
            });
    }
}