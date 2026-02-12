using CommonLayer.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CommonLayer.Models
{
    public class Course
    {       
        [BsonId]
        public ObjectId Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DurationInWeeks {  get; set; }
        public string Description {  get; set; } = string.Empty;
        public Difficulty Difficulty { get; set; }

        public string AuthorFireBaseId { get; set; }

        public Author Author { get; set; }
        public List<Lesson> Lessons { get; set; } = new();
    }
}
