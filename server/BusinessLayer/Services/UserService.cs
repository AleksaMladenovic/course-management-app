using System;
using System.Collections.Generic;
using System.IO.Pipes;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;

namespace BusinessLayer.Services
{
    public class UserService : IUserService
    {
        private IAuthorRepository _userRepository;
        private IStudentRepository _studentRepository;
        public UserService(IAuthorRepository userRepository, IStudentRepository studentRepository)
        {
            this._userRepository = userRepository;
            this._studentRepository = studentRepository;
        }
        public async Task<DTOReturnLoginUserData?> LoginAsync(string firebaseUid)
        {
            var author = await _userRepository.GetByIdAsync(firebaseUid);
            if (author != null)
            {
                return new DTOReturnLoginUserData
                {
                    Name = author.Name,
                    Surname = author.Surname,
                    Email = author.Email,
                    Telephone = author.Telephone,
                    DateOfBirth = author.DateOfBirth,
                    Role = CommonLayer.Enums.RoleType.Author
                };
            }
            var student = await _studentRepository.GetByIdAsync(firebaseUid);
            if (student != null)
            {
                return new DTOReturnLoginUserData
                {
                    Name = student.Name,
                    Surname = student.Surname,
                    Email = student.Email,
                    Telephone = student.Telephone,
                    DateOfBirth = student.DateOfBirth,
                    Role = CommonLayer.Enums.RoleType.Student
                };
            }
            return null;   
        }
    }

}