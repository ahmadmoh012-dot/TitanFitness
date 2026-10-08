using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Scheduling.CreateBooking;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public sealed class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            command,
            cancellationToken);

        return Ok(response);
    }
}