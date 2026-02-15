using System.Net.Http.Headers;
using CommonLayer.Enums;
using CommonLayer.Models;
using MongoDB.Bson;
using NUnit.Framework;

namespace Backend.API.Tests;

public abstract class IntegrationTestBase
{
    protected ApiFactory Factory { get; private set; } = null!;
    protected HttpClient Client { get; private set; } = null!;
    protected TestDatabase TestDb { get; private set; } = null!;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        Factory = new ApiFactory();
        Client = Factory.CreateClient();
        Client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        TestDb = new TestDatabase("mongodb://localhost:27017", ApiFactory.TestDatabaseName);
    }

    [SetUp]
    public async Task SetUp()
    {
        await TestDb.CleanAsync();
    }

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        Client.Dispose();
        Factory.Dispose();
    }

    protected static Author BuildTestAuthor(string firebaseUid)
    {
        return new Author
        {
            Id = ObjectId.GenerateNewId(),
            FirebaseUid = firebaseUid,
            Name = "Test",
            Surname = "Author",
            Email = "test.author@example.com",
            Telephone = "000-000",
            DateOfBirth = new DateTime(1990, 1, 1)
        };
    }

    protected static Course BuildTestCourse(Author author, ObjectId? id = null)
    {
        return new Course
        {
            Id = id ?? ObjectId.GenerateNewId(),
            Name = "Test Course",
            DurationInWeeks = 6,
            Description = "Test course description",
            Difficulty = Difficulty.Easy,
            AuthorFireBaseId = author.FirebaseUid,
            Author = author
        };
    }

    protected static Lesson BuildTestLesson(ObjectId? id = null)
    {
        return new Lesson
        {
            Id = id ?? ObjectId.GenerateNewId(),
            Name = "Test Lesson",
            Description = "Test lesson description",
            DurationInMinutes = 60,
        };
    }

    protected static Student BuildTestStudent(string firebaseUid)
    {
        return new Student
        {
            Id = ObjectId.GenerateNewId(),
            FirebaseUid = firebaseUid,
            Name = "Test",
            Surname = "Student",
            Email = "test.student@example.com",
            Telephone = "000-000",
            DateOfBirth = new DateTime(2000, 1, 1)
        };
    }
}
