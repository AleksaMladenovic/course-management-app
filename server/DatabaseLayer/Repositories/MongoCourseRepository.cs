using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Enums;
using CommonLayer.Interfaces;
using CommonLayer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace DatabaseLayer.Repositories
{
	public sealed class MongoCourseRepository : ICourseRepository
	{
		private readonly IMongoCollection<Course> _collection;
        private readonly IAuthorRepository _authorRepository;

		public MongoCourseRepository(IMongoClient mongoClient, IOptions<MongoSettings> settings, IAuthorRepository authorRepository)
		{
            this._authorRepository = authorRepository;
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

        public async Task CreateCourseAsync(DTOAddCourse dto, CancellationToken cancellationToken = default)
        {
            Author Autor = await this._authorRepository.GetByIdAsync(dto.AuthorFirebaseId,cancellationToken);
            
            var course = new Course
            {
                Name = dto.Name,
                DurationInWeeks = dto.DurationInWeeks,
                Description = dto.Description,
                Difficulty = dto.Difficulty,
                AuthorFireBaseId = dto.AuthorFirebaseId,
                Author= Autor
            };

            await _collection.InsertOneAsync(course, null, cancellationToken);
        }

        public async Task<DTOCoursePagedResponse> GetCoursesAsync(DTOCourseFilter filterDto, CancellationToken cancellationToken = default)
        {
            var filter = Builders<Course>.Filter.Empty;

            if (!string.IsNullOrEmpty(filterDto.Name))
                filter &= Builders<Course>.Filter.Regex(x => x.Name, new BsonRegularExpression(filterDto.Name, "i"));

            if (filterDto.MaxDurationInWeeks > 0)
                filter &= Builders<Course>.Filter.Lte(x => x.DurationInWeeks, filterDto.MaxDurationInWeeks);

            if (filterDto.MinDurationInWeeks > 0)
                filter &= Builders<Course>.Filter.Gte(x => x.DurationInWeeks, filterDto.MinDurationInWeeks);

            if (filterDto.Difficulty.HasValue && filterDto.Difficulty.Value != 0)
                filter &= Builders<Course>.Filter.Eq(x => x.Difficulty, filterDto.Difficulty.Value);

            var sort = filterDto.Sort switch
            {
                CourseSortEnum.Name => Builders<Course>.Sort.Ascending(x => x.Name),
                CourseSortEnum.AscDuration => Builders<Course>.Sort.Ascending(x => x.DurationInWeeks),
                CourseSortEnum.DescDuration => Builders<Course>.Sort.Descending(x => x.DurationInWeeks),
                _ => Builders<Course>.Sort.Ascending(x => x.Name)
            };

            int page = filterDto.PageNumber < 1 ? 1 : filterDto.PageNumber;
            int skip = (page - 1) * filterDto.PageSize;

            var totalCount = await _collection.CountDocumentsAsync(filter,options:null, cancellationToken);

            var items = await _collection.Find(filter)
                .Sort(sort)
                .Skip(skip)
                .Limit(filterDto.PageSize)
                .ToListAsync(cancellationToken);

            var mappedItems = items.ConvertAll(course => new DTOCourseResponse
            {
                Id = course.Id.ToString(),
                Name = course.Name,
                DurationInWeeks = course.DurationInWeeks,
                Description = course.Description,
                Difficulty = course.Difficulty,
                Author = new DTOCourseAuthor{ AuthorFirebaseId = course.AuthorFireBaseId, Name = course.Author.Name, Surname = course.Author.Surname }
            });

            return new DTOCoursePagedResponse
            {
                Items = mappedItems,
                TotalCount = totalCount
            };
        }
    }
}
