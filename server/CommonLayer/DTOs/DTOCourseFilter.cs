using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.Enums;

namespace CommonLayer.DTOs
{
    public class DTOCourseFilter
    {
        public string? Name { get; set; }
        public int? MaxDurationInWeeks { get; set; }
        public int? MinDurationInWeeks { get; set; }
        public Difficulty? Difficulty { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public CourseSortEnum? Sort {  get; set; }
    }
}
