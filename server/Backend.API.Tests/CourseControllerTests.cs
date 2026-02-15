using System.Net;
using System.Net.Http.Json;
using CommonLayer.DTOs;
using CommonLayer.Enums;
using MongoDB.Bson;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace Backend.API.Tests;

[TestFixture]
public sealed class CourseControllerTests : IntegrationTestBase
{
    [Test]
    public async Task Add_Course_Returns_Created()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        await TestDb.SeedAuthorAsync(author);
        var courseDto = new DTOAddCourse
        {
            Name = "Test Course",
            DurationInWeeks = 6,
            Description = "Test course description",
            Difficulty = Difficulty.Easy,
            AuthorFirebaseId = author.FirebaseUid
        };

        var response = await Client.PostAsJsonAsync("/api/Course/addCourse", courseDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        var courseId = await response.Content.ReadFromJsonAsync<string>();
        Assert.That(courseId, Is.Not.Null);
        var course = await TestDb.GetCourseByIdAsync(ObjectId.Parse(courseId!));
        Assert.That(course, Is.Not.Null);
        Assert.That(course!.Name, Is.EqualTo(courseDto.Name));
        Assert.That(course.DurationInWeeks, Is.EqualTo(courseDto.DurationInWeeks));
        Assert.That(course.Description, Is.EqualTo(courseDto.Description));
        Assert.That(course.Difficulty, Is.EqualTo(courseDto.Difficulty));
        Assert.That(course.Author.FirebaseUid, Is.EqualTo(author.FirebaseUid));
    }
    
    [Test]
    public async Task Add_Course_With_Nonexistent_Author_Returns_BadRequest()
    {
        var courseDto = new DTOAddCourse
        {
            Name = "Test Course",
            DurationInWeeks = 6,
            Description = "Test course description",
            Difficulty = Difficulty.Easy,
            AuthorFirebaseId = "nonexistent-firebase-uid"
        };

        var response = await Client.PostAsJsonAsync("/api/Course/addCourse", courseDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Add_Course_With_Invalid_Fields_Returns_BadRequest()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        await TestDb.SeedAuthorAsync(author);

        // Test cases: empty name, negative duration, short description, invalid difficulty, empty author id
        var invalidCourses = new[]
        {
            new DTOAddCourse { Name = "", DurationInWeeks = 6, Description = "Valid description", Difficulty = Difficulty.Easy, AuthorFirebaseId = author.FirebaseUid },
            new DTOAddCourse { Name = "Valid Name", DurationInWeeks = 0, Description = "Valid description", Difficulty = Difficulty.Easy, AuthorFirebaseId = author.FirebaseUid },
            new DTOAddCourse { Name = "Valid Name", DurationInWeeks = 6, Description = "Short", Difficulty = Difficulty.Easy, AuthorFirebaseId = author.FirebaseUid },
            new DTOAddCourse { Name = "Valid Name", DurationInWeeks = 6, Description = "Valid description", Difficulty = 0, AuthorFirebaseId = author.FirebaseUid },
            new DTOAddCourse { Name = "Valid Name", DurationInWeeks = 6, Description = "Valid description", Difficulty = Difficulty.Easy, AuthorFirebaseId = "" }
        };

        foreach (var dto in invalidCourses)
        {
            var response = await Client.PostAsJsonAsync("/api/Course/addCourse", dto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest), $"Failed for DTO: {System.Text.Json.JsonSerializer.Serialize(dto)}");
        }
    }

}
