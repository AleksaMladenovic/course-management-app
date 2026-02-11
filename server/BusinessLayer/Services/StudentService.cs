using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;

namespace BusinessLayer.Services
{
    public class StudentService : IStudentService
    {
        private IStudentRepository _studentRepository;

        public StudentService(IStudentRepository studentRepository)
        {
            this._studentRepository = studentRepository; 
        }

        public async Task<bool>Register(DTORegisterStudent student)
        {
            try 
            {
                await _studentRepository.CreateAsync(new CommonLayer.Models.Student
                {
                    FirebaseUid = student.FirebaseUid,
                    Name = student.Name,
                    Surname = student.Surname,
                    DateOfBirth = student.DateOfBirth,
                    Telephone = student.Telephone,
                    Email = student.Email
                });   
            }
            catch (Exception)
            {
                return false;
            }
        return true;
        }
    }
}
