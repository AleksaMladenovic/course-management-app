using System.Net;
using System.Net.Http.Json;
using CommonLayer.DTOs;
using CommonLayer.Enums;
using NUnit.Framework;

namespace Backend.API.Tests;

[TestFixture]
public sealed class UserControllerTests : IntegrationTestBase
{
    [Test]
    public async Task Login_As_Author_Returns_Ok()
    {
        var author = BuildTestAuthor("author-firebase-uid");
        await TestDb.SeedAuthorAsync(author);

        var response = await Client.PostAsync($"/api/User/login?firebaseUid={author.FirebaseUid}", null);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var userData = await response.Content.ReadFromJsonAsync<DTOReturnLoginUserData>();
        Assert.That(userData, Is.Not.Null);
        Assert.That(userData!.Name, Is.EqualTo(author.Name));
        Assert.That(userData.Surname, Is.EqualTo(author.Surname));
        Assert.That(userData.Email, Is.EqualTo(author.Email));
        Assert.That(userData.Role, Is.EqualTo(RoleType.Author));
    }

    [Test]
    public async Task Login_As_Student_Returns_Ok()
    {
        var student = BuildTestStudent("student-firebase-uid");
        await TestDb.SeedStudentAsync(student);

        var response = await Client.PostAsync($"/api/User/login?firebaseUid={student.FirebaseUid}", null);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var userData = await response.Content.ReadFromJsonAsync<DTOReturnLoginUserData>();
        Assert.That(userData, Is.Not.Null);
        Assert.That(userData!.Name, Is.EqualTo(student.Name));
        Assert.That(userData.Surname, Is.EqualTo(student.Surname));
        Assert.That(userData.Email, Is.EqualTo(student.Email));
        Assert.That(userData.Role, Is.EqualTo(RoleType.Student));
    }

    [Test]
    public async Task Login_With_Nonexistent_FirebaseUid_Returns_BadRequest()
    {
        var response = await Client.PostAsync("/api/User/login?firebaseUid=nonexistent-uid", null);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }
}
