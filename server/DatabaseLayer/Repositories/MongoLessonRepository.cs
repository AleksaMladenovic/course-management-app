using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using CommonLayer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DatabaseLayer.Repositories
{
	public sealed class MongoLessonRepository : ILessonRepository
	{
		private readonly IMongoCollection<Lesson> _collection;
        private readonly IMongoCollection<Course> _courseCollection;

        public MongoLessonRepository(IMongoClient mongoClient, IOptions<MongoSettings> settings)
		{
			var databaseName = settings.Value.DatabaseName;
			if (string.IsNullOrWhiteSpace(databaseName))
			{
				throw new InvalidOperationException("MongoSettings:DatabaseName is missing.");
			}

			var database = mongoClient.GetDatabase(databaseName);
			_collection = database.GetCollection<Lesson>("lessons");
			_courseCollection = database.GetCollection<Course>("courses");
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

        public async Task<bool> AddLessonToCourseAsync(ObjectId courseId, DTOAddLesson lessonDto, CancellationToken cancellationToken = default)
        {
            var newLesson = new Lesson
            {
                Id = ObjectId.GenerateNewId(),
                Name = lessonDto.Name,
                DurationInMinutes = lessonDto.DurationInMinutes,
                Description = lessonDto.Description
            };

            await _collection.InsertOneAsync(newLesson, null, cancellationToken);

            var filter = Builders<Course>.Filter.Eq(c => c.Id, courseId);
            var update = Builders<Course>.Update.Push(c => c.Lessons, newLesson);

            var result = await _courseCollection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);

            return result.ModifiedCount > 0;
        }
    }
}
