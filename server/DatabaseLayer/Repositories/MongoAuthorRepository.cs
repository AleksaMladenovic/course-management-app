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
    public sealed class MongoAuthorRepository : IAuthorRepository
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

        public async Task<Author?> GetByIdAsync(string firebaseUid, CancellationToken cancellationToken = default)
            => await _collection.Find(author => author.FirebaseUid == firebaseUid).FirstOrDefaultAsync(cancellationToken);

        public async Task CreateAsync(Author author, CancellationToken cancellationToken = default)
            => await _collection.InsertOneAsync(author, cancellationToken: cancellationToken);

        public async Task UpdateAsync(string firebaseUid, Author author, CancellationToken cancellationToken = default)
            => await _collection.ReplaceOneAsync(a => a.FirebaseUid == firebaseUid, author, cancellationToken: cancellationToken);

        public async Task DeleteAsync(string firebaseUid, CancellationToken cancellationToken = default)
            => await _collection.DeleteOneAsync(author => author.FirebaseUid == firebaseUid, cancellationToken);
    }
}