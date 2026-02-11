using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StudentController : ControllerBase
{
    IStudentService _studentService;
    public StudentController(IStudentService studentService)
    {
        this._studentService = studentService;        
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] DTORegisterStudent student)
    {
        var result = await _studentService.Register(student);
        if (result)
        {
            return Ok();
        }
        return BadRequest();
    }

}