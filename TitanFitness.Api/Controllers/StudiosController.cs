using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Branches.GetStudiosByBranch;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/studios")]
public sealed class StudiosController : ControllerBase
{
    private readonly IMediator _mediator;

    public StudiosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int branchId,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetStudiosByBranchQuery(branchId),
            cancellationToken);

        return Ok(response);
    }
}