using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.Interfaces;
using CommonLayer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DatabaseLayer.Repositories
{
	public sealed class MongoCourseRepository : ICourseRepository
	{
		private readonly IMongoCollection<Course> _collection;

		public MongoCourseRepository(IMongoClient mongoClient, IOptions<MongoSettings> settings)
		{
			var databaseName = settings.Value.DatabaseName;
			if (string.IsNullOrWhiteSpace(databaseName))
			{
				throw new InvalidOperationException("MongoSettings:DatabaseName is missing.");
			}

			var database = mongoClient.GetDatabase(databaseName);
			_collection = database.GetCollection<Course>("courses");
		}

		public Task<List<Course>> GetAllAsync(CancellationToken cancellationToken = default)
			=> _collection.Find(Builders<Course>.Filter.Empty).ToListAsync(cancellationToken);

		public async Task<Course?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
			=> await _collection.Find(course => course.Id == id).FirstOrDefaultAsync(cancellationToken);

		public Task CreateAsync(Course course, CancellationToken cancellationToken = default)
			=> _collection.InsertOneAsync(course, cancellationToken: cancellationToken);

		public Task UpdateAsync(ObjectId id, Course course, CancellationToken cancellationToken = default)
			=> _collection.ReplaceOneAsync(c => c.Id == id, course, cancellationToken: cancellationToken);

		public Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default)
			=> _collection.DeleteOneAsync(course => course.Id == id, cancellationToken);
	}
}
