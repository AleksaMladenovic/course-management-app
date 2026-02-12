using CommonLayer.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonLayer.Interfaces
{
    public interface ILessonService
    {
        Task<bool> AddLessonToCourseAsync(string courseId, DTOAddLesson dto);
        Task<bool> UpdateLessonAsync(string courseId, string lessonId, DTOUpdateLesson dto);
        Task<bool> DeleteLessonAsync(string courseId, string lessonId);
    }
}
