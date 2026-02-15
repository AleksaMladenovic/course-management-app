using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.DTOs
{
    public class DTORegisterAuthor
    {
        [Required]
        [MinLength(1, ErrorMessage = "FirebaseUid must not be empty.")]
        public required string FirebaseUid { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters long.")]
        public required string Name { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2, ErrorMessage = "Surname must be at least 2 characters long.")]
        public required string Surname { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        public required string Email { get; set; } = string.Empty;
        
        [Required]
        [Phone(ErrorMessage = "Telephone must be a valid phone number.")]
        public required string Telephone { get; set; } = string.Empty;
        
        [Required]
        public required DateTime DateOfBirth { get; set; }
    }
}
