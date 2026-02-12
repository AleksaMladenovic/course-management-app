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

        [HttpPut("updateLesson/{courseId}/{lessonId}")]
        public async Task<IActionResult> UpdateLesson(string courseId, string lessonId, [FromBody] DTOUpdateLesson dto)
        {
            var result = await _lessonService.UpdateLessonAsync(courseId, lessonId, dto);

            if (!result)
            {
                return BadRequest("Nije moguće pronaći kurs ili lekciju sa zadatim parametrima.");
            }

            return Ok("Lekcija je uspešno ažurirana.");
        }

        [HttpDelete("deleteLesson/{courseId}/{lessonId}")]
        public async Task<IActionResult> DeleteLesson(string courseId, string lessonId)
        {
            var result = await _lessonService.DeleteLessonAsync(courseId, lessonId);

            if (!result)
            {
                return BadRequest("Nije moguće obrisati lekciju. Proverite ID-eve.");
            }

            return Ok("Uspesno obrisana lekcija iz kursa.");
        }
    }
}
