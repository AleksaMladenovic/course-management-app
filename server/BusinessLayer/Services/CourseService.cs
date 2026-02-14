using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using CommonLayer.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository courseRepository;
        private readonly IAuthorRepository authorRepository;
        
        public CourseService(ICourseRepository courseRepository, IAuthorRepository authorRepository)
        {
            this.courseRepository = courseRepository;
            this.authorRepository = authorRepository;
        }

        public async Task<string> AddCourseAsync(DTOAddCourse dto)
        {
            string courseId = await this.courseRepository.CreateCourseAsync(dto);
            await this.authorRepository.AddCourseToAuthorAsync(dto.AuthorFirebaseId, courseId);
            return courseId;
        }

        public async Task<DTOCourseWithLessons?> GetCourseByIdAsync(string id)
        {   
            return await courseRepository.GetCourseByIdAsync(id);
        }
        public async Task<bool> UpdateCourseAsync(string id, DTOUpdateCourse dto)
        {
            if (!ObjectId.TryParse(id, out var objId)) return false;
            return await courseRepository.UpdateCourseAsync(objId, dto);
        }

        public async Task<bool> DeleteCourseAsync(string id)
        {
            if (!ObjectId.TryParse(id, out var objId)) return false;
            return await courseRepository.DeleteCourseAsync(objId);
        }

        public async Task<DTOCoursePagedResponse> GetCoursesAsync(DTOCourseFilter filter)
        {
            var result = await courseRepository.GetCoursesAsync(filter);

            return result;
        }
    }
}
