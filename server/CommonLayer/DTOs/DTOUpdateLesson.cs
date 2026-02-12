using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTOUpdateLesson
    {
        public string? Name { get; set; }
        public int? DurationInMinutes { get; set; }
        public string? Description { get; set; }
    }
}
