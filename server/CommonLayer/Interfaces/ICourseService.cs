using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Models;

namespace CommonLayer.Interfaces
{
    public interface ICourseService
    {
        public Task<bool> AddCourseAsync(DTOAddCourse dto);
        public Task<DTOCoursePagedResponse> GetCoursesAsync(DTOCourseFilter filter);
        public Task<DTOCourseWithLessons?> GetCourseByIdAsync(string id);

    }
}
