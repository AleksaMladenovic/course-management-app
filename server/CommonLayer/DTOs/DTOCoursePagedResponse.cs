using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTOCoursePagedResponse
    {
        public List<DTOCourseResponse> Items { get; set; } = new();
        public long TotalCount { get; set; }
    }
}
