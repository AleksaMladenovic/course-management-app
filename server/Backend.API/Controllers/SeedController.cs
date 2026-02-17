using Microsoft.AspNetCore.Mvc;
using BusinessLayer.Services;
using CommonLayer.Models;
using System.Threading.Tasks;
using CommonLayer.Interfaces;
using BusinessLayer.Mongo;
using CommonLayer.DTOs;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly IAuthorService _authorService;
        private readonly ICourseService _courseService;
        private readonly IStudentService _studentService;
        private readonly IWebHostEnvironment _env;
        private readonly IMongoConnectionTester _mongoTester;

        public SeedController(
            IAuthorService authorService,
            ICourseService courseService,
            IStudentService studentService,
            IWebHostEnvironment env,
            IMongoConnectionTester mongoTester
        )
        {
            _authorService = authorService;
            _courseService = courseService;
            _studentService = studentService;
            _env = env;
            _mongoTester = mongoTester;
        }

        private bool IsAllowedEnvironment()
        {
            // Dozvoljeno samo za Test okruženje
            return _env.EnvironmentName == "Test";
        }



        // Dodaj dodatne seed metode po potrebi, koristi isti pattern
        [HttpPut("DeleteTestDatabase")]
        public async Task<IActionResult> DeleteTestDatabase(CancellationToken cancellationToken)
        {
            if (!IsAllowedEnvironment())
            {
                return Forbid();
            }

            var result = await _mongoTester.DeleteTestDatabaseAsync(cancellationToken);
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    ok = true,
                    message = result.Message,
                    timestampUtc = DateTime.UtcNow
                });
            }

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                ok = false,
                message = result.Message,
                timestampUtc = DateTime.UtcNow
            });
        }

        [HttpPost("seed-random-courses")]
        public async Task<ActionResult<List<DTOCourseResponse>>> SeedRandomCourses(CancellationToken cancellationToken)
        {
            if (!IsAllowedEnvironment())
                return Forbid();

            var random = new Random();
            var authorNames = new[] { "Ana", "Boris", "Ceca", "Dejan", "Elena" };
            var authors = new List<DTORegisterAuthor>();

            // 1. Kreiraj 5 autora
            foreach (var name in authorNames)
            {
                DTORegisterAuthor dto = new DTORegisterAuthor
                {
                    FirebaseUid = $"{name.ToLower()}-uid",
                    Name = name,
                    Surname = "Smith",
                    Email = $"{name.ToLower()}@example.com",
                    Telephone = "+381601234567",
                    DateOfBirth = new DateTime(1980, 1, 1)
                };
                await _authorService.Register(dto);
                authors.Add(dto);
            }

            // 2. Za svakog autora, 10 kurseva
            var courses = new List<DTOCourseResponse>();
            var difficulties = Enum.GetValues(typeof(CommonLayer.Enums.Difficulty)).Cast<CommonLayer.Enums.Difficulty>().ToArray();
            foreach (var author in authors)
            {
                for (int i = 0; i < 10; i++)
                {
                    var course = new DTOAddCourse
                    {
                        Name = $"{author.Name.Split(' ')[0]} Course {i + 1}",
                        Description = $"Opis kursa {i + 1} za autora {author.Name}",
                        DurationInWeeks = random.Next(4, 13),
                        Difficulty = difficulties[random.Next(difficulties.Length)],
                        AuthorFirebaseId = author.FirebaseUid
                    };
                    var id = await _courseService.AddCourseAsync(course);
                    courses.Add(new DTOCourseResponse
                    {
                        Id = id,
                        Name = course.Name,
                        Description = course.Description,
                        DurationInWeeks = course.DurationInWeeks,
                        Difficulty = course.Difficulty,
                        Author = new DTOCourseAuthor
                        {
                            AuthorFirebaseId = author.FirebaseUid,
                            Name = author.Name,
                            Surname = author.Surname
                        }
                    });
                }
            }
            return Ok(courses);
        }   
    }
}
