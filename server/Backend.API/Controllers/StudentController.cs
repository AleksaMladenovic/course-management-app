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

    [HttpGet("StudentIsEnrolledToCourse/{studentFirebaseUid}/{courseId}")]
    public async Task<IActionResult> StudentIsEnrolledToCourse(string studentFirebaseUid, string courseId)
    {
        var result = await _studentService.StudentIsEnrolledToCourse(studentFirebaseUid, courseId);
        return Ok(result);
    }

    [HttpPost("EnrollStudentToCourse/{studentFirebaseUid}/{courseId}")]
    public async Task<IActionResult> EnrollStudentToCourse(string studentFirebaseUid, string courseId)
    {
        await _studentService.EnrollStudentToCourse(studentFirebaseUid, courseId);
        return Ok();
    }

    [HttpPost("UnEnrollStudentFromCourse/{studentFirebaseUid}/{courseId}")]
    public async Task<IActionResult> UnEnrollStudentFromCourse(string studentFirebaseUid, string courseId)
    {
        await _studentService.UnEnrollStudentFromCourse(studentFirebaseUid, courseId);
        return Ok();
    }
}