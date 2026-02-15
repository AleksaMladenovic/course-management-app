using System.Net;
using System.Net.Http.Json;
using CommonLayer.DTOs;
using CommonLayer.Models;
using MongoDB.Bson;
using NUnit.Framework;

namespace Backend.API.Tests;

[TestFixture]
public sealed class LessonControllerTests : IntegrationTestBase
{
    // addLesson tests
    [Test]
    public async Task Add_Lesson_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);

        var lessonDto = new DTOAddLesson
        {
            Name = "Test Lesson",
            DurationInMinutes = 60,
            Description = "Test lesson description"
        };

        var response = await Client.PostAsJsonAsync($"/api/Lessons/addLesson/{course.Id}", lessonDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var lessonCount = await TestDb.GetLessonCountInCourseAsync(course.Id.ToString());
        Assert.That(lessonCount, Is.EqualTo(1));
    }

    [Test]
    public async Task Add_Lesson_To_Nonexistent_Course_Returns_BadRequest()
    {
        var lessonDto = new DTOAddLesson
        {
            Name = "Test Lesson",
            DurationInMinutes = 60,
            Description = "Test lesson description"
        };

        var response = await Client.PostAsJsonAsync($"/api/Lessons/addLesson/{ObjectId.GenerateNewId()}", lessonDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Add_Few_Lessons_To_Course_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        var lessons = new List<Lesson>();
        for (int i = 1; i <= 5; i++)
        {
            var lessonDto = new DTOAddLesson
            {
                Name = $"Test Lesson {i}",
                DurationInMinutes = 60 + i,
                Description = $"Test lesson description {i}"
            };

            var response = await Client.PostAsJsonAsync($"/api/Lessons/addLesson/{course.Id}", lessonDto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

            var lessonCount = await TestDb.GetLessonCountInCourseAsync(course.Id.ToString());
            Assert.That(lessonCount, Is.EqualTo(i));
        }
    }

    [Test]
    public async Task Add_Lesson_With_Invalid_Fields_Returns_BadRequest()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);

        // Test cases: empty name, negative duration, short description
        var invalidLessons = new[]
        {
            new DTOAddLesson { Name = "", DurationInMinutes = 60, Description = "Valid description" },
            new DTOAddLesson { Name = "Valid Name", DurationInMinutes = 0, Description = "Valid description" },
            new DTOAddLesson { Name = "Valid Name", DurationInMinutes = 60, Description = "Short" }
        };

        foreach (var dto in invalidLessons)
        {
            var response = await Client.PostAsJsonAsync($"/api/Lessons/addLesson/{course.Id}", dto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest), $"Failed for DTO: {System.Text.Json.JsonSerializer.Serialize(dto)}");
        }
    }

    // updateLesson tests
    [Test]
    public async Task Update_Lesson_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        var lesson = BuildTestLesson();
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.AddLessonToCourseAsync(course.Id.ToString(), lesson);

        var updateDto = new DTOUpdateLesson
        {
            Name = "Updated Lesson",
            DurationInMinutes = 90,
            Description = "Updated lesson description"
        };

        var response = await Client.PutAsJsonAsync($"/api/Lessons/updateLesson/{course.Id}/{lesson.Id}", updateDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var updatedLesson = await TestDb.GetLessonFromCourseAsync(course.Id.ToString(), lesson.Id.ToString());
        Assert.That(updatedLesson, Is.Not.Null);
        Assert.That(updatedLesson!.Name, Is.EqualTo(updateDto.Name));
        Assert.That(updatedLesson.DurationInMinutes, Is.EqualTo(updateDto.DurationInMinutes));
        Assert.That(updatedLesson.Description, Is.EqualTo(updateDto.Description));
    }

    [Test]
    public async Task Update_Lesson_Partially_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        var lesson = BuildTestLesson();
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.AddLessonToCourseAsync(course.Id.ToString(), lesson);

        var updateDto = new DTOUpdateLesson
        {
            Name = "Partially Updated Lesson"
        };

        var response = await Client.PutAsJsonAsync($"/api/Lessons/updateLesson/{course.Id}/{lesson.Id}", updateDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var updatedLesson = await TestDb.GetLessonFromCourseAsync(course.Id.ToString(), lesson.Id.ToString());
        Assert.That(updatedLesson, Is.Not.Null);
        Assert.That(updatedLesson!.Name, Is.EqualTo(updateDto.Name));
        Assert.That(updatedLesson.DurationInMinutes, Is.EqualTo(lesson.DurationInMinutes));
        Assert.That(updatedLesson.Description, Is.EqualTo(lesson.Description));

        updateDto = new DTOUpdateLesson
        {
            Description = "Partially Updated Lesson Description"
        };

        response = await Client.PutAsJsonAsync($"/api/Lessons/updateLesson/{course.Id}/{lesson.Id}", updateDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        updatedLesson = await TestDb.GetLessonFromCourseAsync(course.Id.ToString(), lesson.Id.ToString());
        Assert.That(updatedLesson, Is.Not.Null);
        Assert.That(updatedLesson.DurationInMinutes, Is.EqualTo(lesson.DurationInMinutes));
        Assert.That(updatedLesson.Description, Is.EqualTo(updateDto.Description));

        updateDto = new DTOUpdateLesson
        {
            DurationInMinutes = 120
        };
        response = await Client.PutAsJsonAsync($"/api/Lessons/updateLesson/{course.Id}/{lesson.Id}", updateDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        updatedLesson = await TestDb.GetLessonFromCourseAsync(course.Id.ToString(), lesson.Id.ToString());
        Assert.That(updatedLesson, Is.Not.Null);
        Assert.That(updatedLesson.DurationInMinutes, Is.EqualTo(updateDto.DurationInMinutes));
    }
    [Test]
    public async Task Update_Nonexistent_Lesson_Returns_BadRequest()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);

        var updateDto = new DTOUpdateLesson
        {
            Name = "Updated Lesson",
            DurationInMinutes = 90,
            Description = "Updated lesson description"
        };

        var response = await Client.PutAsJsonAsync($"/api/Lessons/updateLesson/{course.Id}/{ObjectId.GenerateNewId()}", updateDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Update_Lesson_With_Invalid_Fields_Returns_BadRequest()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        var lesson = BuildTestLesson();
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.AddLessonToCourseAsync(course.Id.ToString(), lesson);

        // Test cases: empty name, negative duration, short description
        var invalidLessons = new[]
        {
            new DTOUpdateLesson { Name = "", DurationInMinutes = 90, Description = "Valid description" },
            new DTOUpdateLesson { Name = "Valid Name", DurationInMinutes = 0, Description = "Valid description" },
            new DTOUpdateLesson { Name = "Valid Name", DurationInMinutes = 90, Description = "Short" }
        };

        foreach (var dto in invalidLessons)
        {
            var response = await Client.PutAsJsonAsync($"/api/Lessons/updateLesson/{course.Id}/{lesson.Id}", dto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest), $"Failed for DTO: {System.Text.Json.JsonSerializer.Serialize(dto)}");
        }
    }

    // deleteLesson tests
    [Test]
    public async Task Delete_Lesson_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        var lesson = BuildTestLesson();
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.AddLessonToCourseAsync(course.Id.ToString(), lesson);

        var response = await Client.DeleteAsync($"/api/Lessons/deleteLesson/{course.Id}/{lesson.Id}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var lessonCount = await TestDb.GetLessonCountInCourseAsync(course.Id.ToString());
        Assert.That(lessonCount, Is.EqualTo(0));
    }

    [Test]
    public async Task Delete_Nonexistent_Lesson_Returns_BadRequest()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);

        var response = await Client.DeleteAsync($"/api/Lessons/deleteLesson/{course.Id}/{ObjectId.GenerateNewId()}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Delete_Lesson_From_Nonexistent_Course_Returns_BadRequest()
    {
        var response = await Client.DeleteAsync($"/api/Lessons/deleteLesson/{ObjectId.GenerateNewId()}/{ObjectId.GenerateNewId()}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}
