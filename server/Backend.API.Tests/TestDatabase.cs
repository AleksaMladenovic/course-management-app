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

    public async Task<Course?> GetCourseByIdAsync(ObjectId id)
    {
        var courses = _database.GetCollection<Course>("courses");
        return await courses.Find(c => c.Id == id).FirstOrDefaultAsync();
    }
}
