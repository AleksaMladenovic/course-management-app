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
