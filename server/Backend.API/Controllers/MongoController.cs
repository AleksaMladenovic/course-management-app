using BusinessLayer.Mongo;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MongoController : ControllerBase
{
    private readonly IMongoConnectionTester _tester;

    public MongoController(IMongoConnectionTester tester)
    {
        _tester = tester;
    }

    [HttpGet("ping")]
    public async Task<IActionResult> Ping(CancellationToken cancellationToken)
    {
        var result = await _tester.TestAsync(cancellationToken);
        if (result.IsSuccess)
        {
            return Ok(new
            {
                ok = true,
                database = result.DatabaseName,
                message = result.Message,
                timestampUtc = DateTime.UtcNow
            });
        }

        return StatusCode(StatusCodes.Status503ServiceUnavailable, new
        {
            ok = false,
            message = result.Message,
            timestampUtc = DateTime.UtcNow
        });
    }
}
