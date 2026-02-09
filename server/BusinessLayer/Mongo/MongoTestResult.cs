namespace BusinessLayer.Mongo;

public sealed record MongoTestResult(bool IsSuccess, string Message, string DatabaseName)
{
    public static MongoTestResult Success(string databaseName) =>
        new(true, "MongoDB ping OK", databaseName);

    public static MongoTestResult Fail(string message) =>
        new(false, message, string.Empty);
}
