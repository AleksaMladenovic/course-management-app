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
        private ICourseRepository _courseRepository;

        public StudentService(IStudentRepository studentRepository, ICourseRepository courseRepository)
        {
            this._studentRepository = studentRepository;
            this._courseRepository = courseRepository;
        }

        public async Task<bool> Register(DTORegisterStudent student)
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

        public async Task<bool> StudentIsEnrolledToCourse(string studentFirebaseUid, string courseId)
        {
            return await _studentRepository.StudentIsEnrolledToCourse(studentFirebaseUid, courseId);
        }

        public async Task EnrollStudentToCourse(string studentFirebaseUid, string courseId)
        {
            await _studentRepository.EnrollStudentToCourse(studentFirebaseUid, courseId);
            await _courseRepository.EnrollStudentToCourseAsync(courseId, studentFirebaseUid);
            return;
        }

        public async Task UnEnrollStudentFromCourse(string studentFirebaseUid, string courseId)
        {
            await _studentRepository.UnEnrollStudentFromCourse(studentFirebaseUid, courseId);
            await _courseRepository.UnEnrollStudentFromCourse(courseId, studentFirebaseUid);
        }
    }
}
