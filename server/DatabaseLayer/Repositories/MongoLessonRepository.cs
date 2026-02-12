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
        public async Task<bool> UpdateLessonAsync(ObjectId courseId, ObjectId lessonId, DTOUpdateLesson updateDto, CancellationToken cancellationToken = default)
        {
            var lessonUpdateList = new List<UpdateDefinition<Lesson>>();
            var courseUpdateList = new List<UpdateDefinition<Course>>();

            if (!string.IsNullOrWhiteSpace(updateDto.Name))
            {
                lessonUpdateList.Add(Builders<Lesson>.Update.Set(l => l.Name, updateDto.Name));
                courseUpdateList.Add(Builders<Course>.Update.Set("Lessons.$.Name", updateDto.Name));
            }

            if (updateDto.DurationInMinutes!=0)
            {
                lessonUpdateList.Add(Builders<Lesson>.Update.Set(l => l.DurationInMinutes, updateDto.DurationInMinutes));
                courseUpdateList.Add(Builders<Course>.Update.Set("Lessons.$.DurationInMinutes", updateDto.DurationInMinutes));
            }

            if (!string.IsNullOrWhiteSpace(updateDto.Description))
            {
                lessonUpdateList.Add(Builders<Lesson>.Update.Set(l => l.Description, updateDto.Description));
                courseUpdateList.Add(Builders<Course>.Update.Set("Lessons.$.Description", updateDto.Description));
            }

            if (lessonUpdateList.Count == 0) return true;

            var finalLessonUpdate = Builders<Lesson>.Update.Combine(lessonUpdateList);
            var finalCourseUpdate = Builders<Course>.Update.Combine(courseUpdateList);

            await _collection.UpdateOneAsync(l => l.Id == lessonId, finalLessonUpdate, cancellationToken: cancellationToken);

            var courseFilter = Builders<Course>.Filter.And(
                Builders<Course>.Filter.Eq(c => c.Id, courseId),
                Builders<Course>.Filter.ElemMatch(c => c.Lessons, l => l.Id == lessonId)
            );

            var result = await _courseCollection.UpdateOneAsync(courseFilter, finalCourseUpdate, cancellationToken: cancellationToken);

            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteLessonAsync(ObjectId courseId, ObjectId lessonId, CancellationToken cancellationToken = default)
        {
            await _collection.DeleteOneAsync(l => l.Id == lessonId, cancellationToken);

            var courseFilter = Builders<Course>.Filter.Eq(c => c.Id, courseId);

            var courseUpdate = Builders<Course>.Update.PullFilter(c => c.Lessons, l => l.Id == lessonId);

            var result = await _courseCollection.UpdateOneAsync(courseFilter, courseUpdate, cancellationToken: cancellationToken);

            return result.ModifiedCount > 0;
        }
    }
}
