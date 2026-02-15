using System.Net;
using System.Net.Http.Json;
using CommonLayer.DTOs;
using CommonLayer.Enums;
using CommonLayer.Models;
using MongoDB.Bson;
using NUnit.Framework;
using NUnit.Framework.Internal;
using NUnit.Framework.Legacy;

namespace Backend.API.Tests;

[TestFixture]
public sealed class CourseControllerTests : IntegrationTestBase
{
    // addCourse tests
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
        Assert.That(course.EnrolledStudents, Is.Empty);
        author = await TestDb.GetAuthorByFirebaseUidAsync(author.FirebaseUid);
        Assert.That(author, Is.Not.Null);
        Assert.That(author.Courses, Does.Contain(courseId));
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

    // updateCourse tests
    [Test]
    public async Task Update_Course_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);

        var courseDto = new DTOUpdateCourse
        {
            Name = "Updated Course",
            DurationInWeeks = 8,
            Description = "Updated description",
            Difficulty = Difficulty.Medium,
        };

        var response = await Client.PutAsJsonAsync($"/api/Course/updateCourse/{course.Id}", courseDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var updatedCourse = await TestDb.GetCourseByIdAsync(course.Id);
        Assert.That(updatedCourse, Is.Not.Null);
        Assert.That(updatedCourse!.Name, Is.EqualTo(courseDto.Name));
        Assert.That(updatedCourse.DurationInWeeks, Is.EqualTo(courseDto.DurationInWeeks));
        Assert.That(updatedCourse.Description, Is.EqualTo(courseDto.Description));
        Assert.That(updatedCourse.Difficulty, Is.EqualTo(courseDto.Difficulty));
    }

    [Test]
    public async Task Update_Nonexistent_Course_Returns_BadRequest()
    {
        var courseDto = new DTOUpdateCourse
        {
            Name = "Updated Course",
            DurationInWeeks = 8,
            Description = "Updated description",
            Difficulty = Difficulty.Medium,
        };

        var response = await Client.PutAsJsonAsync($"/api/Course/updateCourse/{ObjectId.GenerateNewId()}", courseDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));  
    }

    [Test]
    public async Task Update_Course_With_Invalid_Fields_Returns_BadRequest()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        // Test cases: empty name, negative duration, short description, invalid difficulty
        var invalidCourses = new[]
        {
            new DTOUpdateCourse { Name = "", DurationInWeeks = 8, Description = "Valid description", Difficulty = Difficulty.Medium },
            new DTOUpdateCourse { Name = "Valid Name", DurationInWeeks = 0, Description = "Valid description", Difficulty = Difficulty.Medium },
            new DTOUpdateCourse { Name = "Valid Name", DurationInWeeks = 8, Description = "Short", Difficulty = Difficulty.Medium },
            new DTOUpdateCourse { Name = "Valid Name", DurationInWeeks = 8, Description = "Valid description", Difficulty = 0 }
        };

        foreach (var dto in invalidCourses)
        {
            var response = await Client.PutAsJsonAsync($"/api/Course/updateCourse/{course.Id}", dto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest), $"Failed for DTO: {System.Text.Json.JsonSerializer.Serialize(dto)}");
        }
    }

    [Test]
    public async Task Update_Course_With_No_Changes_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);

        var courseDto = new DTOUpdateCourse
        {
            Name = course.Name,
            DurationInWeeks = course.DurationInWeeks,
            Description = course.Description,
            Difficulty = course.Difficulty,
        };

        var response = await Client.PutAsJsonAsync($"/api/Course/updateCourse/{course.Id}", courseDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var updatedCourse = await TestDb.GetCourseByIdAsync(course.Id);
        Assert.That(updatedCourse, Is.Not.Null);
        Assert.That(updatedCourse!.Name, Is.EqualTo(courseDto.Name));
        Assert.That(updatedCourse.DurationInWeeks, Is.EqualTo(courseDto.DurationInWeeks));
        Assert.That(updatedCourse.Description, Is.EqualTo(courseDto.Description));
        Assert.That(updatedCourse.Difficulty, Is.EqualTo(courseDto.Difficulty));
    }

    // deleteCourse
    [Test]
    public async Task Delete_Course_Returns_Ok()
    {
        var author = BuildTestAuthor("test-firebase-uid");
        var course = BuildTestCourse(author);
        var student1 = new Student
        {
            Id = ObjectId.GenerateNewId(),
            FirebaseUid = "student1-firebase-uid",
            Name = "Test",
            Surname = "Student1",
            Email = ""
        };
        var student2 = new Student
        {
            Id = ObjectId.GenerateNewId(),
            FirebaseUid = "student2-firebase-uid",
            Name = "Test",
            Surname = "Student2",
            Email = ""
        };
        await TestDb.SeedStudentAsync(student1);
        await TestDb.SeedStudentAsync(student2);
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.UpdateStudentCoursesAsync(student1.FirebaseUid, new List<string> { course.Id.ToString() });
        await TestDb.UpdateStudentCoursesAsync(student2.FirebaseUid, new List<string> { course.Id.ToString() });
        await TestDb.UpdateAuthorCoursesAsync(author.FirebaseUid, new List<string> { course.Id.ToString() });
        await TestDb.UpdateEnrolledStudentsAsync(course.Id.ToString(), new List<string> { student1.FirebaseUid, student2.FirebaseUid });
        
        var response = await Client.DeleteAsync($"/api/Course/deleteCourse/{course.Id}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var deletedCourse = await TestDb.GetCourseByIdAsync(course.Id);
        Assert.That(deletedCourse, Is.Null);
        var updatedStudent1 = await TestDb.GetStudentByFirebaseUidAsync(student1.FirebaseUid);
        var updatedStudent2 = await TestDb.GetStudentByFirebaseUidAsync(student2.FirebaseUid);
        Assert.That(updatedStudent1!.Courses, Does.Not.Contain(course.Id.ToString()));
        Assert.That(updatedStudent2!.Courses, Does.Not.Contain(course.Id.ToString()));
        var updatedAuthor = await TestDb.GetAuthorByFirebaseUidAsync(author.FirebaseUid);
        Assert.That(updatedAuthor!.Courses, Does.Not.Contain(course.Id.ToString()));
    }

    [Test]
    public async Task Delete_Nonexistent_Course_Returns_BadRequest()
    {
        var response = await Client.DeleteAsync($"/api/Course/deleteCourse/{ObjectId.GenerateNewId()}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
    
}
