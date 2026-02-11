using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.Models
{
    public class Lesson
    {
        public int Id {  get; set; }
        public string Name { get; set; }
        public int DurationInMinutes {  get; set; }
        public string Description { get; set; }
        public Course? Course { get; set; }
    }
}
