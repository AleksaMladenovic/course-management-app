using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CommonLayer.Models
{
    public class Student
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string FirebaseUid {  get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname  { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telephone {  get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; } 
        public List<Course> Courses { get; set; } = new();
    }
}
