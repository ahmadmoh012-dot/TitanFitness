using MediatR;
using Microsoft.AspNetCore.Mvc;
using TitanFitness.Application.Branches.GetBranches;

namespace TitanFitness.Api.Controllers;

[ApiController]
[Route("api/branches")]
public sealed class BranchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public BranchesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(
            new GetBranchesQuery(),
            cancellationToken);

        return Ok(response);
    }
}