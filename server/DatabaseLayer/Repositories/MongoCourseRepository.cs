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
            var query = _collection.AsQueryable();

            if (!string.IsNullOrEmpty(filterDto.Name))
                query = query.Where(x => x.Name.Contains(filterDto.Name));

            if (filterDto.MaxDurationInWeeks > 0)
            {
                query = query.Where(x => x.DurationInWeeks <= filterDto.MaxDurationInWeeks &&
                                         x.DurationInWeeks >= filterDto.MinDurationInWeeks);
            }

            if (filterDto.Difficulty.HasValue && filterDto.Difficulty.Value != 0)
                query = query.Where(x => x.Difficulty == filterDto.Difficulty.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            query = filterDto.Sort switch
            {
                CourseSortEnum.Name => query.OrderBy(x => x.Name),
                CourseSortEnum.AscDuration => query.OrderBy(x => x.DurationInWeeks),
                CourseSortEnum.DescDuration => query.OrderByDescending(x => x.DurationInWeeks),
                _ => query 
            };

            int page = filterDto.PageNumber < 1 ? 1 : filterDto.PageNumber;
            int skip = (page - 1) * filterDto.PageSize;

            var items = await query.Skip(skip)
                                  .Take(filterDto.PageSize)
                                  .Select(c => new DTOCourseResponse
                                  {
                                      Id = c.Id.ToString(),
                                      Name = c.Name,
                                      DurationInWeeks = c.DurationInWeeks,
                                      Description = c.Description,
                                      Difficulty = c.Difficulty,
                                      Author = new DTOCourseAuthor
                                      {
                                          AuthorFirebaseId = c.AuthorFireBaseId,
                                          Name = c.Author.Name,
                                          Surname = c.Author.Surname
                                      }
                                  })
                                  .ToListAsync(cancellationToken);

            return new DTOCoursePagedResponse
            {
                Items = items,
                TotalCount = totalCount
            };
        }
    }
}
