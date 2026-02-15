using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.Enums;

namespace CommonLayer.DTOs
{
    public class DTOCourseFilter : IValidatableObject
    {
        public string? Name { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "MaxDurationInWeeks must be greater than 0")]
        public int? MaxDurationInWeeks { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "MinDurationInWeeks must be greater than 0")]
        public int? MinDurationInWeeks { get; set; }
        [EnumDataType(typeof(Difficulty), ErrorMessage = "Difficulty must be a valid value.")]
        public Difficulty? Difficulty { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be greater than 0")]
        public int PageNumber { get; set; } = 1;
        [Range(1, int.MaxValue, ErrorMessage = "PageSize must be greater than 0")]
        public int PageSize { get; set; } = 10;
        [EnumDataType(typeof(CourseSortEnum), ErrorMessage = "Sort must be a valid value.")]
        public CourseSortEnum? Sort { get; set; }


        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (MinDurationInWeeks.HasValue && MaxDurationInWeeks.HasValue)
            {
                if (MinDurationInWeeks > MaxDurationInWeeks)
                {
                    yield return new ValidationResult(
                        "MinDurationInWeeks must be less than or equal to MaxDurationInWeeks.",
                        new[] { nameof(MinDurationInWeeks), nameof(MaxDurationInWeeks) }
                    );
                }
            }
        }
    }
}
