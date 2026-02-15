using CommonLayer.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTOUpdateCourse
    {
        [MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
        public string? Name { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be a positive integer.")]
        public int? DurationInWeeks { get; set; }
        [MinLength(10, ErrorMessage = "Description must be at least 10 characters long.")]
        public string? Description { get; set; }
        [EnumDataType(typeof(Difficulty), ErrorMessage = "Difficulty must be a valid value.")]
        public Difficulty? Difficulty { get; set; }
    }
}
