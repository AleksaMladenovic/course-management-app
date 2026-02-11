using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class UserController : ControllerBase
{
    IUserService _userService;
    public UserController(IUserService userService)
    {
        this._userService = userService;        
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(string firebaseUid)
    {
        var result = await _userService.LoginAsync(firebaseUid);
        if (result != null)
        {
            return Ok(result);
        }
        return BadRequest();
    }
}