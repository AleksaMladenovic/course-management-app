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

        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody] DTOAddCourse dto)
        {
            var result = await courseService.AddCourseAsync(dto);
            if (result)
            {
                return Ok("Uspesno dodat kurs");
            }
            return BadRequest("Ne uspesno dodat kurs");
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

        [HttpPut]
        public async Task<IActionResult> GetCoursesAsync([FromBody] DTOCourseFilter dto)
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


    }
   
}
