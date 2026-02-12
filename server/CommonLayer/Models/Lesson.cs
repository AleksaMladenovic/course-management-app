using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CommonLayer.Models
{
    public class Lesson
    {
        [BsonId]
        public ObjectId Id {  get; set; }
        public string Name { get; set; } = string.Empty;
        public int DurationInMinutes {  get; set; }
        public string Description { get; set; } = string.Empty;

    }
}
