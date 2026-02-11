using CommonLayer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));

builder.Services.AddSingleton<IMongoClient>(serviceProvider =>
{
    var settings = serviceProvider.GetRequiredService<IOptions<MongoSettings>>().Value;
    if (string.IsNullOrWhiteSpace(settings.ConnectionString))
    {
        throw new InvalidOperationException("MongoSettings:ConnectionString is missing.");
    }

    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton<BusinessLayer.Mongo.IMongoConnectionTester, BusinessLayer.Mongo.MongoConnectionTester>();

// Repository DI registrations
builder.Services.AddScoped<CommonLayer.Interfaces.IAuthorRepository, DatabaseLayer.Repositories.MongoAuthorRepository>();
builder.Services.AddScoped<CommonLayer.Interfaces.IStudentRepository, DatabaseLayer.Repositories.MongoStudentRepository>();
builder.Services.AddScoped<CommonLayer.Interfaces.ICourseRepository, DatabaseLayer.Repositories.MongoCourseRepository>();
builder.Services.AddScoped<CommonLayer.Interfaces.ILessonRepository, DatabaseLayer.Repositories.MongoLessonRepository>();

// Service DI registrations
builder.Services.AddScoped<CommonLayer.Interfaces.IStudentService, BusinessLayer.Services.StudentService>();
builder.Services.AddScoped<CommonLayer.Interfaces.IAuthorService, BusinessLayer.Services.AuthorService>();

// CORS policy for frontend dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
