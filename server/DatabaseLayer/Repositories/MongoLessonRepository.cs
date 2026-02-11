using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DatabaseLayer.Repositories
{
	public sealed class MongoLessonRepository
	{
		private readonly IMongoCollection<Lesson> _collection;

		public MongoLessonRepository(IMongoClient mongoClient, IOptions<MongoSettings> settings)
		{
			var databaseName = settings.Value.DatabaseName;
			if (string.IsNullOrWhiteSpace(databaseName))
			{
				throw new InvalidOperationException("MongoSettings:DatabaseName is missing.");
			}

			var database = mongoClient.GetDatabase(databaseName);
			_collection = database.GetCollection<Lesson>("lessons");
		}

		public Task<List<Lesson>> GetAllAsync(CancellationToken cancellationToken = default)
			=> _collection.Find(Builders<Lesson>.Filter.Empty).ToListAsync(cancellationToken);

		public async Task<Lesson?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
			=> await _collection.Find(lesson => lesson.Id == id).FirstOrDefaultAsync(cancellationToken);

		public Task CreateAsync(Lesson lesson, CancellationToken cancellationToken = default)
			=> _collection.InsertOneAsync(lesson, cancellationToken: cancellationToken);

		public Task UpdateAsync(ObjectId id, Lesson lesson, CancellationToken cancellationToken = default)
			=> _collection.ReplaceOneAsync(l => l.Id == id, lesson, cancellationToken: cancellationToken);

		public Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default)
			=> _collection.DeleteOneAsync(lesson => lesson.Id == id, cancellationToken);
	}
}
