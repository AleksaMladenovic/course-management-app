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
	public sealed class MongoStudentRepository
	{
		private readonly IMongoCollection<Student> _collection;

		public MongoStudentRepository(IMongoClient mongoClient, IOptions<MongoSettings> settings)
		{
			var databaseName = settings.Value.DatabaseName;
			if (string.IsNullOrWhiteSpace(databaseName))
			{
				throw new InvalidOperationException("MongoSettings:DatabaseName is missing.");
			}

			var database = mongoClient.GetDatabase(databaseName);
			_collection = database.GetCollection<Student>("students");
		}

		public Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default)
			=> _collection.Find(Builders<Student>.Filter.Empty).ToListAsync(cancellationToken);

		public async Task<Student?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
			=> await _collection.Find(student => student.Id == id).FirstOrDefaultAsync(cancellationToken);

		public Task CreateAsync(Student student, CancellationToken cancellationToken = default)
			=> _collection.InsertOneAsync(student, cancellationToken: cancellationToken);

		public Task UpdateAsync(ObjectId id, Student student, CancellationToken cancellationToken = default)
			=> _collection.ReplaceOneAsync(s => s.Id == id, student, cancellationToken: cancellationToken);

		public Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default)
			=> _collection.DeleteOneAsync(student => student.Id == id, cancellationToken);
	}
}
