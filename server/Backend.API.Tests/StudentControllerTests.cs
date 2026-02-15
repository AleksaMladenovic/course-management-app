using System.Net;
using System.Net.Http.Json;
using CommonLayer.DTOs;
using MongoDB.Bson;
using NUnit.Framework;

namespace Backend.API.Tests;

[TestFixture]
public sealed class StudentControllerTests : IntegrationTestBase
{
    // Register tests
    [Test]
    public async Task Register_Student_Returns_Ok()
    {
        var registerDto = new DTORegisterStudent
        {
            FirebaseUid = "student-uid",
            Name = "John",
            Surname = "Doe",
            Email = "john.doe@example.com",
            Telephone = "+381601234567",
            DateOfBirth = new DateTime(2000, 1, 1)
        };

        var response = await Client.PostAsJsonAsync("/api/Student/register", registerDto);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var student = await TestDb.GetStudentByFirebaseUidAsync(registerDto.FirebaseUid);
        Assert.That(student, Is.Not.Null);
        Assert.That(student.Name, Is.EqualTo(registerDto.Name));
        Assert.That(student.Email, Is.EqualTo(registerDto.Email));
    }

    [Test]
    public async Task Register_Student_With_Invalid_Fields_Returns_BadRequest()
    {
        var invalidStudents = new[]
        {
            new DTORegisterStudent { FirebaseUid = "", Name = "John", Surname = "Doe", Email = "john@example.com", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterStudent { FirebaseUid = "uid", Name = "", Surname = "Doe", Email = "john@example.com", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterStudent { FirebaseUid = "uid", Name = "John", Surname = "", Email = "john@example.com", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterStudent { FirebaseUid = "uid", Name = "John", Surname = "Doe", Email = "invalid-email", Telephone = "+381601234567", DateOfBirth = DateTime.Now },
            new DTORegisterStudent { FirebaseUid = "uid", Name = "John", Surname = "Doe", Email = "john@example.com", Telephone = "", DateOfBirth = DateTime.Now }
        };

        foreach (var dto in invalidStudents)
        {
            var response = await Client.PostAsJsonAsync("/api/Student/register", dto);
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest), $"Failed for DTO: {System.Text.Json.JsonSerializer.Serialize(dto)}");
        }
    }

    // EnrollStudentToCourse tests
    [Test]
    public async Task Enroll_Student_To_Course_Returns_Ok()
    {
        var author = BuildTestAuthor("author-uid");
        var course = BuildTestCourse(author);
        var student = BuildTestStudent("student-uid");
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.SeedStudentAsync(student);

        var response = await Client.PostAsync($"/api/Student/EnrollStudentToCourse/{student.FirebaseUid}/{course.Id}", null);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var updatedStudent = await TestDb.GetStudentByFirebaseUidAsync(student.FirebaseUid);
        Assert.That(updatedStudent.Courses, Does.Contain(course.Id.ToString()));

        var updatedCourse = await TestDb.GetCourseByIdAsync(course.Id);
        Assert.That(updatedCourse!.EnrolledStudents, Does.Contain(student.FirebaseUid));
    }

    [Test]
    public async Task Enroll_Student_To_Nonexistent_Course_Returns_BadRequest()
    {
        var student = BuildTestStudent("student-uid");
        await TestDb.SeedStudentAsync(student);

        var response = await Client.PostAsync($"/api/Student/EnrollStudentToCourse/{student.FirebaseUid}/{ObjectId.GenerateNewId()}", null);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest).Or.EqualTo(HttpStatusCode.InternalServerError));
    }

    // UnEnrollStudentFromCourse tests
    [Test]
    public async Task UnEnroll_Student_From_Course_Returns_Ok()
    {
        var author = BuildTestAuthor("author-uid");
        var course = BuildTestCourse(author);
        var student = BuildTestStudent("student-uid");
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.SeedStudentAsync(student);

        await TestDb.UpdateStudentCoursesAsync(student.FirebaseUid, new List<string> { course.Id.ToString() });
        await TestDb.UpdateEnrolledStudentsAsync(course.Id.ToString(), new List<string> { student.FirebaseUid });

        var response = await Client.PostAsync($"/api/Student/UnEnrollStudentFromCourse/{student.FirebaseUid}/{course.Id}", null);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var updatedStudent = await TestDb.GetStudentByFirebaseUidAsync(student.FirebaseUid);
        Assert.That(updatedStudent.Courses, Does.Not.Contain(course.Id.ToString()));

        var updatedCourse = await TestDb.GetCourseByIdAsync(course.Id);
        Assert.That(updatedCourse!.EnrolledStudents, Does.Not.Contain(student.FirebaseUid));
    }

    // StudentIsEnrolledToCourse tests
    [Test]
    public async Task Check_Student_Is_Enrolled_Returns_True()
    {
        var author = BuildTestAuthor("author-uid");
        var course = BuildTestCourse(author);
        var student = BuildTestStudent("student-uid");
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.SeedStudentAsync(student);

        await TestDb.UpdateStudentCoursesAsync(student.FirebaseUid, new List<string> { course.Id.ToString() });

        var response = await Client.GetAsync($"/api/Student/StudentIsEnrolledToCourse/{student.FirebaseUid}/{course.Id}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var isEnrolled = await response.Content.ReadFromJsonAsync<bool>();
        Assert.That(isEnrolled, Is.True);
    }

    [Test]
    public async Task Check_Student_Is_Not_Enrolled_Returns_False()
    {
        var author = BuildTestAuthor("author-uid");
        var course = BuildTestCourse(author);
        var student = BuildTestStudent("student-uid");
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course);
        await TestDb.SeedStudentAsync(student);

        var response = await Client.GetAsync($"/api/Student/StudentIsEnrolledToCourse/{student.FirebaseUid}/{course.Id}");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var isEnrolled = await response.Content.ReadFromJsonAsync<bool>();
        Assert.That(isEnrolled, Is.False);
    }

    // GetStudentCourses tests
    [Test]
    public async Task Get_Student_Courses_Returns_Ok()
    {
        var author = BuildTestAuthor("author-uid");
        var course1 = BuildTestCourse(author, ObjectId.GenerateNewId());
        var course2 = BuildTestCourse(author, ObjectId.GenerateNewId());
        course2.Name = "Another Course";
        var student = BuildTestStudent("student-uid");
        
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course1);
        await TestDb.SeedCourseAsync(course2);
        await TestDb.SeedStudentAsync(student);
        await TestDb.UpdateStudentCoursesAsync(student.FirebaseUid, new List<string> { course1.Id.ToString(), course2.Id.ToString() });

        var response = await Client.GetAsync($"/api/Student/{student.FirebaseUid}/courses");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var courses = await response.Content.ReadFromJsonAsync<List<DTOCourseResponse>>();
        Assert.That(courses, Is.Not.Null);
        Assert.That(courses!.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task Get_Student_Courses_With_No_Courses_Returns_Empty_List()
    {
        var student = BuildTestStudent("student-uid");
        await TestDb.SeedStudentAsync(student);

        var response = await Client.GetAsync($"/api/Student/{student.FirebaseUid}/courses");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var courses = await response.Content.ReadFromJsonAsync<List<DTOCourseResponse>>();
        Assert.That(courses, Is.Not.Null);
        Assert.That(courses!.Count, Is.EqualTo(0));
    }

    // GetStudentStats tests
    [Test]
    public async Task Get_Student_Stats_Returns_Ok()
    {
        var author = BuildTestAuthor("author-uid");
        var course1 = BuildTestCourse(author, ObjectId.GenerateNewId());
        var course2 = BuildTestCourse(author, ObjectId.GenerateNewId());
        var student = BuildTestStudent("student-uid");
        
        await TestDb.SeedAuthorAsync(author);
        await TestDb.SeedCourseAsync(course1);
        await TestDb.SeedCourseAsync(course2);
        await TestDb.SeedStudentAsync(student);
        await TestDb.UpdateStudentCoursesAsync(student.FirebaseUid, new List<string> { course1.Id.ToString(), course2.Id.ToString() });

        var response = await Client.GetAsync($"/api/Student/{student.FirebaseUid}/stats");
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var stats = await response.Content.ReadFromJsonAsync<DTOStudentsStats>();
        Assert.That(stats, Is.Not.Null);
        Assert.That(stats!.TotalCourses, Is.EqualTo(2));
    }
}
