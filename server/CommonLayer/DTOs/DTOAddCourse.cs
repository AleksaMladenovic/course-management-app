using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.Enums;

namespace CommonLayer.DTOs
{
    public class DTOAddCourse
    {
        [Required]
        [MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
        public required string Name { get; set; }
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be a positive integer.")]
        public required int DurationInWeeks { get; set; }
        [Required]
        [MinLength(10, ErrorMessage = "Description must be at least 10 characters long.")]
        public required string Description { get; set; }
        [Required]
        [EnumDataType(typeof(Difficulty), ErrorMessage = "Difficulty must be a valid value.")]
        public required Difficulty Difficulty { get; set; }
        [Required]
        [MinLength(1, ErrorMessage = "AuthorFirebaseId must not be empty.")]
        public required string AuthorFirebaseId {  get; set; }
    }
}
