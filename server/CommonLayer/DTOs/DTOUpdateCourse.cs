using CommonLayer.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTOUpdateCourse
    {
        public string? Name { get; set; }
        public int? DurationInWeeks { get; set; }
        public string? Description { get; set; }
        public Difficulty? Difficulty { get; set; }
    }
}
