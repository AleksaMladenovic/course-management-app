using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.Enums;

namespace CommonLayer.DTOs
{
    public class DTOAddCourse
    {
        public string Name { get; set; } = string.Empty;
        public int DurationInWeeks { get; set; }
        public string Description { get; set; } = string.Empty;
        public Difficulty Difficulty { get; set; }
        public string AuthorFirebaseId {  get; set; }
    }
}
