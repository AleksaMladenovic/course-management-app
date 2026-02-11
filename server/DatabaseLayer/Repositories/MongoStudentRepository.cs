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
	public sealed class MongoStudentRepository: IStudentRepository
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
			_collection.Indexes.CreateOne(new CreateIndexModel<Student>(
				Builders<Student>.IndexKeys.Ascending(s => s.FirebaseUid),
				new CreateIndexOptions { Unique = true }));
		}

		public Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default)
			=> _collection.Find(Builders<Student>.Filter.Empty).ToListAsync(cancellationToken);

		public async Task<Student?> GetByIdAsync(string firebaseUid, CancellationToken cancellationToken = default)
			=> await _collection.Find(student => student.FirebaseUid == firebaseUid).FirstOrDefaultAsync(cancellationToken);

		public Task CreateAsync(Student student, CancellationToken cancellationToken = default)
			=> _collection.InsertOneAsync(student, cancellationToken: cancellationToken);

		public Task UpdateAsync(string firebaseUid, Student student, CancellationToken cancellationToken = default)
			=> _collection.ReplaceOneAsync(s => s.FirebaseUid == firebaseUid, student, cancellationToken: cancellationToken);

		public Task DeleteAsync(string firebaseUid, CancellationToken cancellationToken = default)
			=> _collection.DeleteOneAsync(student => student.FirebaseUid == firebaseUid, cancellationToken);
	}
}
