using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.Enums;

namespace CommonLayer.Models
{
    public class Course
    {       
        public int Id { get; set; }
        public string Name { get; set; }
        public int DurationInWeeks {  get; set; }
        public string Description {  get; set; }
        public Difficulty Difficulty { get; set; }

        public List<Lesson>? Lessons { get; set; }
    }
}
