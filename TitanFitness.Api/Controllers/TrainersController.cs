using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Trainers.CreateTrainer;
using TitanFitness.Application.Trainers.GetTrainerById;
using TitanFitness.Application.Trainers.GetTrainers;
using TitanFitness.Application.Trainers.UpdateTrainer;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/trainers")]
public sealed class TrainersController : ControllerBase
{
    private readonly IMediator _mediator;

    public TrainersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrainers(
        [FromQuery] int? branchId,
        [FromQuery] string? query,
        [FromQuery] int page = 1,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var response = await _mediator.Send(
            new GetTrainersQuery(
                branchId,
                query,
                isActive,
                page),
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{trainerId:int}")]
    public async Task<IActionResult> GetById(
        int trainerId,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetTrainerByIdQuery(trainerId),
            cancellationToken);

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTrainerCommand command,
        CancellationToken cancellationToken)
    {
        var trainerId = await _mediator.Send(
            command,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { trainerId },
            new { id = trainerId });
    }

    [HttpPut("{trainerId:int}")]
    public async Task<IActionResult> Update(
        int trainerId,
        [FromBody] UpdateTrainerCommand command,
        CancellationToken cancellationToken)
    {
        var request = command with
        {
            Id = trainerId
        };

        await _mediator.Send(
            request,
            cancellationToken);

        return NoContent();
    }
}