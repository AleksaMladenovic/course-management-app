namespace BusinessLayer.Mongo;

public interface IMongoConnectionTester
{
    Task<MongoTestResult> TestAsync(CancellationToken cancellationToken = default);
}
