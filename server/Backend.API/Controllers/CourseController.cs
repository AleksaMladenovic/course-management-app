using BusinessLayer.Services;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class CourseController : ControllerBase
    {
        private ICourseService courseService;

        public CourseController(ICourseService courseService)
        {
            this.courseService = courseService;
        }

        [HttpPost("addCourse")]
        public async Task<IActionResult> AddCourse([FromBody] DTOAddCourse dto)
        {
            try
            {
                string courseId = await courseService.AddCourseAsync(dto);
                return Ok(courseId);
            }
            catch (Exception ex)
            {
                return BadRequest("Neuspešno dodat kurs: " + ex.Message);
            }
        }
        [HttpPut("updateCourse/{id}")]
        public async Task<IActionResult> UpdateCourse(string id, [FromBody] DTOUpdateCourse dto)
        {
            var success = await courseService.UpdateCourseAsync(id, dto);
            if (!success) return BadRequest("Kurs nije pronađen ili nema izmena.");
            return Ok("Kurs uspešno ažuriran.");
        }

        [HttpDelete("deleteCourse/{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            var success = await courseService.DeleteCourseAsync(id);
            if (!success) return BadRequest("Kurs nije pronađen.");
            return Ok("Uspesno obrisan kurs"); 
        }

        [HttpGet("getCoursesByFilter")]
        public async Task<IActionResult> GetCoursesAsync([FromQuery] DTOCourseFilter dto)
        {
            var result = await courseService.GetCoursesAsync(dto);
            if (result != null)
            {
                return Ok(result);
            }
            else {
                return BadRequest("Greska pri filtriranju");
            }
        }
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetCourseById([FromRoute] string id)
        {
            DTOCourseWithLessons? result = await courseService.GetCourseByIdAsync(id);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest("Greska pri dohvatanju kursa");
            }
        }
    }
}