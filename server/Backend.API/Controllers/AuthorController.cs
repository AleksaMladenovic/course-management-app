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

    [HttpGet("{authorFirebaseUid}/courses")]
    public async Task<IActionResult> GetAuthorCourses(string authorFirebaseUid)
    {
        var courses = await _authorService.GetAuthorCourses(authorFirebaseUid);
        return Ok(courses);
    }

    [HttpGet("{authorFirebaseUid}/stats")]
    public async Task<IActionResult> GetAuthorStats(string authorFirebaseUid)
    {
        var stats = await _authorService.GetAuthorStats(authorFirebaseUid);
        return Ok(stats);
    }
}