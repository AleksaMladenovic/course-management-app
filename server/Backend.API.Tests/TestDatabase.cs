using CommonLayer.Models;
using MongoDB.Driver;
using MongoDB.Bson;

namespace Backend.API.Tests;

public sealed class TestDatabase
{
    private readonly MongoClient _client;
    private readonly IMongoDatabase _database;

    public TestDatabase(string connectionString, string databaseName)
    {
        _client = new MongoClient(connectionString);
        _database = _client.GetDatabase(databaseName);
    }

    public IMongoDatabase Database => _database;

    public async Task CleanAsync()
    {
        var collections = await _database.ListCollectionNames().ToListAsync();
        foreach (var collection in collections)
        {
            await _database.DropCollectionAsync(collection);
        }
    }

    public async Task<Author> SeedAuthorAsync(Author author)
    {
        var authors = _database.GetCollection<Author>("authors");
        await authors.InsertOneAsync(author);
        return author;
    }

    public async Task<Course> SeedCourseAsync(Course course)
    {
        var courses = _database.GetCollection<Course>("courses");
        await courses.InsertOneAsync(course);
        return course;
    }

    public async Task<Student> SeedStudentAsync(Student student)
    {
        var students = _database.GetCollection<Student>("students");
        await students.InsertOneAsync(student);
        return student;
    }

    public async Task<Course?> GetCourseByIdAsync(ObjectId id)
    {
        var courses = _database.GetCollection<Course>("courses");
        return await courses.Find(c => c.Id == id).FirstOrDefaultAsync();
    }
    public async Task<Author?> GetAuthorByFirebaseUidAsync(string firebaseUid)
    {
        var authors = _database.GetCollection<Author>("authors");
        return await authors.Find(a => a.FirebaseUid == firebaseUid).FirstOrDefaultAsync();
    }

    public async Task UpdateAuthorCoursesAsync(string firebaseUid, List<string> courseIds)
    {
        var authors = _database.GetCollection<Author>("authors");
        var update = Builders<Author>.Update.Set(a => a.Courses, courseIds);
        await authors.UpdateOneAsync(a => a.FirebaseUid == firebaseUid, update);
    }

    public async Task UpdateStudentCoursesAsync(string firebaseUid, List<string> courseIds)
    {
        var students = _database.GetCollection<Student>("students");
        var update = Builders<Student>.Update.Set(s => s.Courses, courseIds);
        await students.UpdateOneAsync(s => s.FirebaseUid == firebaseUid, update);
    }

    internal async Task<Student> GetStudentByFirebaseUidAsync(string firebaseUid)
    {
        var students = _database.GetCollection<Student>("students");
        return await students.Find(s => s.FirebaseUid == firebaseUid).FirstOrDefaultAsync() ?? throw new InvalidOperationException($"Student with Firebase UID '{firebaseUid}' not found.");
    }

    internal async Task UpdateEnrolledStudentsAsync(string courseId, List<string> studentFirebaseUids)
    {
        var courses = _database.GetCollection<Course>("courses");
        var update = Builders<Course>.Update.Set(c => c.EnrolledStudents, studentFirebaseUids);
        await courses.UpdateOneAsync(c => c.Id.ToString() == courseId, update);
    }
}
