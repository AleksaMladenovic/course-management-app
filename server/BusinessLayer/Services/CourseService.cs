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
        
        public CourseService(ICourseRepository courseRepository)
        {
            this.courseRepository = courseRepository;
        }

        public async Task<bool> AddCourseAsync(DTOAddCourse dto)
        {
            await this.courseRepository.CreateCourseAsync(dto);
            return true;
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
