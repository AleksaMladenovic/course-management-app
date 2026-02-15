using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTOAddLesson
    {
        [Required]
        [MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
        public required string Name { get; set; } = string.Empty;
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be a positive integer.")]
        public required int DurationInMinutes { get; set; }
        
        [Required]
        [MinLength(10, ErrorMessage = "Description must be at least 10 characters long.")]
        public required string Description { get; set; } = string.Empty;
    }
}
