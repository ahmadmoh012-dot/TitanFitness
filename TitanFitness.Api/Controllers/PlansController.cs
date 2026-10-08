using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Plans.CreatePlan;
using TitanFitness.Application.Plans.GetPlanById;
using TitanFitness.Application.Plans.GetPlans;
using TitanFitness.Application.Plans.UpdatePlan;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/plans")]
public sealed class PlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlans(
        [FromQuery] int? branchId,
        [FromQuery] string? query,
        [FromQuery] int page = 1,
        [FromQuery] bool? isPublished = null,
        CancellationToken cancellationToken = default)
    {
        var response = await _mediator.Send(
            new GetPlansQuery(
                query,
                isPublished,
                page),
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{planId:int}")]
    public async Task<IActionResult> GetById(
        int planId,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetPlanByIdQuery(planId),
            cancellationToken);

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePlanCommand command,
        CancellationToken cancellationToken)
    {
        var planId = await _mediator.Send(
            command,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { planId },
            new { id = planId });
    }

    [HttpPut("{planId:int}")]
    public async Task<IActionResult> Update(
        int planId,
        [FromBody] UpdatePlanCommand command,
        CancellationToken cancellationToken)
    {
        var request = command with
        {
            Id = planId
        };

        await _mediator.Send(
            request,
            cancellationToken);

        return NoContent();
    }
}