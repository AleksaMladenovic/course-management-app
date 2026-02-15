using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Backend.API.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string TestDatabaseName = "course_management_test";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            var overrides = new Dictionary<string, string?>
            {
                ["MongoSettings:ConnectionString"] = "mongodb://localhost:27017",
                ["MongoSettings:DatabaseName"] = TestDatabaseName
            };

            config.AddInMemoryCollection(overrides);
        });
    }
}
