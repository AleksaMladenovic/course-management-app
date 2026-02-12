using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public LessonsController(ILessonService lessonService)
        {
            _lessonService = lessonService;
        }

        [HttpPost("addLesson/{courseId}")]
        public async Task<IActionResult> AddLesson([FromRoute]string courseId, [FromBody] DTOAddLesson dto)
        {
            try
            {
                var result = await _lessonService.AddLessonToCourseAsync(courseId, dto);
                if (result) return Ok("Lekcija uspešno dodata.");
                return BadRequest("Došlo je do greške prilikom dodavanja.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
    }
}
