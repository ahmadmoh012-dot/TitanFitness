using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.CheckIns.CreateCheckIn;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/check-ins")]
public sealed class CheckInsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CheckInsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCheckInCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command,
            cancellationToken);

        return Ok(response);
    }
}