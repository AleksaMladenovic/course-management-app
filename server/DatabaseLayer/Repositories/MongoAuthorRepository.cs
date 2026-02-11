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
    public sealed class MongoAuthorRepository
    {
        private readonly IMongoCollection<Author> _collection;

        public MongoAuthorRepository(IMongoClient mongoClient, IOptions<MongoSettings> settings)
        {
            var databaseName = settings.Value.DatabaseName;
            if (string.IsNullOrWhiteSpace(databaseName))
            {
                throw new InvalidOperationException("MongoSettings:DatabaseName is missing.");
            }

            var database = mongoClient.GetDatabase(databaseName);
            _collection = database.GetCollection<Author>("authors");
        }

        public Task<List<Author>> GetAllAsync(CancellationToken cancellationToken = default)
            => _collection.Find(Builders<Author>.Filter.Empty).ToListAsync(cancellationToken);

        public async Task<Author?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
            => await _collection.Find(author => author.Id == id).FirstOrDefaultAsync(cancellationToken);

        public Task CreateAsync(Author author, CancellationToken cancellationToken = default)
            => _collection.InsertOneAsync(author, cancellationToken: cancellationToken);

        public Task UpdateAsync(ObjectId id, Author author, CancellationToken cancellationToken = default)
            => _collection.ReplaceOneAsync(a => a.Id == id, author, cancellationToken: cancellationToken);

        public Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default)
            => _collection.DeleteOneAsync(author => author.Id == id, cancellationToken);
    }
}