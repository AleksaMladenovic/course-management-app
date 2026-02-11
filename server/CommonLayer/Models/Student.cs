using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.Models
{
    public class Student
    {
        public string Uuid {  get; set; }
        public string Id { get; set; }
        public string Name { get; set; }
        public string Surname  { get; set; }
        public string Email { get; set; }
        public string Telephone {  get; set; }
        public DateTime DateOfBirth { get; set; } 
        public List<Course>? Courses { get; set; }
    }
}
