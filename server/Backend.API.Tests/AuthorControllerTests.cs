using System.Net;
using System.Net.Http.Json;
using CommonLayer.DTOs;
using MongoDB.Bson;
using NUnit.Framework;

namespace Backend.API.Tests;

[TestFixture]
public sealed class AuthorControllerTests : IntegrationTestBase
{
    // Register tests
    [Test]
    public async Task Register_Author_Returns_Ok()
    {
        var registerDto = new DTORegisterAuthor
        {
            FirebaseUid = "author-uid",
            Name = "Jane",
            Surname = "Smith",
            Email = "jane.smith@example.com",
            Telephone = "+381601234567",
            DateOfBirth = new DateTime(1985, 5, 15)
        };

        var response = await Client.PostAsJsonAsync("/api/Author/register", registerDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var author = await TestDb.GetAuthorByFirebaseUidAsync(registerDto.FirebaseUid);
        Assert.That(author, Is.Not.Null);
        Assert.That(author.Name, Is.EqualTo(registerDto.Name));
        Assert.That(author.Email, Is.EqualTo(registerDto.Email));
    }

    [Test]
    public async Task Register_Author_With_Invalid_Fields_Returns_BadRequest()
    {
        var invalidAuthors = new[]
        {
            new DTORegisterAuthor { FirebaseUid = "", Name = "Jane", Surname = "Smith", Email = "jane@example.com", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterAuthor { FirebaseUid = "uid", Name = "", Surname = "Smith", Email = "jane@example.com", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterAuthor { FirebaseUid = "uid", Name = "Jane", Surname = "", Email = "jane@example.com", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterAuthor { FirebaseUid = "uid", Name = "Jane", Surname = "Smith", Email = "invalid-email", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterAuthor { FirebaseUid = "uid", Name = "Jane", Surname = "Smith", Email = "jane@example.com", Telephone = "", DateOfBirth = DateTime.Now }
        };

        foreach (var dto in invalidAuthors)
        {
            var response = await Client.PostAsJsonAsync("/api/Author/register", dto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest), $"Failed for DTO: {System.Text.Json.JsonSerializer.Serialize(dto)}");
        }
    }

    // GetAuthorCourses tests
    [Test]
    public async Task Get_Author_Courses_Returns_Ok()
    {
        var author = BuildTestAuthor("author-uid");
        var course1 = BuildTestCourse(author, ObjectId.GenerateNewId());
        var course2 = BuildTestCourse(author, ObjectId.GenerateNewId());
        course2.Name = "Advanced Course";
        
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course1);
        await TestDb.SeedCourseAsync(course2);
        await TestDb.UpdateAuthorCoursesAsync(author.FirebaseUid, new List<string> { course1.Id.ToString(), course2.Id.ToString() });

        var response = await Client.GetAsync($"/api/Author/{author.FirebaseUid}/courses");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var courses = await response.Content.ReadFromJsonAsync<List<DTOCourseResponse>>();
        Assert.That(courses, Is.Not.Null);
        Assert.That(courses!.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task Get_Author_Courses_With_No_Courses_Returns_Empty_List()
    {
        var author = BuildTestAuthor("author-uid");
        await TestDb.SeedAuthorAsync(author);

        var response = await Client.GetAsync($"/api/Author/{author.FirebaseUid}/courses");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var courses = await response.Content.ReadFromJsonAsync<List<DTOCourseResponse>>();
        Assert.That(courses, Is.Not.Null);
        Assert.That(courses!.Count, Is.EqualTo(0));
    }

    // GetAuthorStats tests
    [Test]
    public async Task Get_Author_Stats_Returns_Ok()
    {
        var author = BuildTestAuthor("author-uid");
        var course1 = BuildTestCourse(author, ObjectId.GenerateNewId());
        var course2 = BuildTestCourse(author, ObjectId.GenerateNewId());
        var student1 = BuildTestStudent("student1-uid");
        var student2 = BuildTestStudent("student2-uid");
        
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course1);
        await TestDb.SeedCourseAsync(course2);
        await TestDb.SeedStudentAsync(student1);
        await TestDb.SeedStudentAsync(student2);
        await TestDb.UpdateAuthorCoursesAsync(author.FirebaseUid, new List<string> { course1.Id.ToString(), course2.Id.ToString() });
        await TestDb.UpdateEnrolledStudentsAsync(course1.Id.ToString(), new List<string> { student1.FirebaseUid, student2.FirebaseUid });
        await TestDb.UpdateEnrolledStudentsAsync(course2.Id.ToString(), new List<string> { student1.FirebaseUid });

        var response = await Client.GetAsync($"/api/Author/{author.FirebaseUid}/stats");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var stats = await response.Content.ReadFromJsonAsync<DTOAuthorStats>();
        Assert.That(stats, Is.Not.Null);
        Assert.That(stats!.TotalCourses, Is.EqualTo(2));
        Assert.That(stats.TotalStudents, Is.EqualTo(2)); // Unique students
    }

    [Test]
    public async Task Get_Author_Stats_With_No_Courses_Returns_Zero()
    {
        var author = BuildTestAuthor("author-uid");
        await TestDb.SeedAuthorAsync(author);

        var response = await Client.GetAsync($"/api/Author/{author.FirebaseUid}/stats");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var stats = await response.Content.ReadFromJsonAsync<DTOAuthorStats>();
        Assert.That(stats, Is.Not.Null);
        Assert.That(stats!.TotalCourses, Is.EqualTo(0));
        Assert.That(stats.TotalStudents, Is.EqualTo(0));
    }
}
