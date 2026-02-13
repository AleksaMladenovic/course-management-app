using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;

namespace BusinessLayer.Services
{
    public class AuthorService : IAuthorService
    {
        private IAuthorRepository _authorRepository;
        private ICourseRepository _courseRepository;

        public AuthorService(IAuthorRepository authorRepository, ICourseRepository courseRepository)
        {
            this._authorRepository = authorRepository; 
            this._courseRepository = courseRepository;
        }

        public Task<List<DTOCourseResponse>> GetAuthorCourses(string authorFirebaseUid)
        {
            List<string> coursesIds = _authorRepository.GetCoursesByAuthorIdAsync(authorFirebaseUid);
            List<DTOCourseResponse> courses = new List<DTOCourseResponse>();
            foreach (var courseId in coursesIds)
            _courseRepository.GetCourseDTOByIdAsync(courseId).ContinueWith(task =>
            {
                if (task.Result != null)
                {
                    courses.Add((DTOCourseResponse)task.Result);
                }
            }).Wait();
            return Task.FromResult(courses);
        }

        public async Task<bool>Register(DTORegisterAuthor author)
        {
            try 
            {
                await _authorRepository.CreateAsync(new CommonLayer.Models.Author
                {
                    FirebaseUid = author.FirebaseUid,
                    Name = author.Name,
                    Surname = author.Surname,
                    DateOfBirth = author.DateOfBirth,
                    Telephone = author.Telephone,
                    Email = author.Email
                });   
            }
            catch (Exception ex)
            {
                return false;
            }
            return true;
        }
    }
}
