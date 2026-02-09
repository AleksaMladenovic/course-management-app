using CommonLayer.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace BusinessLayer.Mongo;

public sealed class MongoConnectionTester : IMongoConnectionTester
{
    private readonly IMongoClient _mongoClient;
    private readonly MongoSettings _settings;
    private readonly ILogger<MongoConnectionTester> _logger;

    public MongoConnectionTester(
        IMongoClient mongoClient,
        IOptions<MongoSettings> settings,
        ILogger<MongoConnectionTester> logger)
    {
        _mongoClient = mongoClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<MongoTestResult> TestAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.DatabaseName))
        {
            return MongoTestResult.Fail("MongoSettings:DatabaseName is missing.");
        }

        try
        {
            var database = _mongoClient.GetDatabase(_settings.DatabaseName);
            var pingCommand = new BsonDocument("ping", 1);
            await database.RunCommandAsync<BsonDocument>(pingCommand, cancellationToken: cancellationToken);

            return MongoTestResult.Success(_settings.DatabaseName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MongoDB ping failed");
            return MongoTestResult.Fail(ex.Message);
        }
    }
}
