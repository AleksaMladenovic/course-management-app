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

		public async Task EnrollStudentToCourse(string firebaseUid, string courseId, CancellationToken cancellationToken = default)
		{
			var filter = Builders<Student>.Filter.Eq(s => s.FirebaseUid, firebaseUid);
			var update = Builders<Student>.Update.AddToSet(s => s.Courses, courseId);
			await _collection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
			return;
		}

		public async Task<bool> StudentIsEnrolledToCourse(string studentFirebaseUid, string courseId, CancellationToken cancellationToken = default)
		{
			var filter = Builders<Student>.Filter.And(
				Builders<Student>.Filter.Eq(s => s.FirebaseUid, studentFirebaseUid),
				Builders<Student>.Filter.AnyEq(s => s.Courses, courseId)
			);
			return await _collection.Find(filter).AnyAsync(cancellationToken);
		}

        public Task UnEnrollStudentFromCourse(string studentFirebaseUid, string courseId)
		{
			var filter = Builders<Student>.Filter.Eq(s => s.FirebaseUid, studentFirebaseUid);
			var update = Builders<Student>.Update.Pull(s => s.Courses, courseId);
			return _collection.UpdateOneAsync(filter, update);
		}

        public Task<List<string>> GetStudentCourses(string studentFirebaseUid, CancellationToken cancellationToken = default)
		{
			var filter = Builders<Student>.Filter.Eq(s => s.FirebaseUid, studentFirebaseUid);
			var student = _collection.Find(filter).FirstOrDefault(cancellationToken);
			return Task.FromResult(student?.Courses ?? new List<string>());
		}
    }
}
