using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthorController : ControllerBase
{
    IAuthorService _authorService;
    public AuthorController(IAuthorService authorService)
    {
        this._authorService = authorService;        
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DTORegisterAuthor author)
    {
        var result = await _authorService.Register(author);
        if (result)
        {
            return Ok();
        }
        return BadRequest();
    }

}