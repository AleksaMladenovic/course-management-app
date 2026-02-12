using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTOAddLesson
    {
        public string Name { get; set; } = string.Empty;
        public int DurationInMinutes { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
