namespace BusinessLayer.Mongo;

public interface IMongoConnectionTester
{
    Task<MongoTestResult> DeleteTestDatabaseAsync(CancellationToken cancellationToken);
    Task<MongoTestResult> TestAsync(CancellationToken cancellationToken = default);
}
