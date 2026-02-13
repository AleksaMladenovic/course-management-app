using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Models;
using MongoDB.Bson;

namespace CommonLayer.Interfaces
{
    public interface ICourseRepository
    {
        Task<List<Course>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Course?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task CreateAsync(Course course, CancellationToken cancellationToken = default);
        Task UpdateAsync(ObjectId id, Course course, CancellationToken cancellationToken = default);
        Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task<string> CreateCourseAsync(DTOAddCourse dto, CancellationToken cancellationToken = default);
        Task<bool> UpdateCourseAsync(ObjectId id, DTOUpdateCourse dto, CancellationToken cancellationToken = default);
        Task<bool> DeleteCourseAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task<DTOCoursePagedResponse> GetCoursesAsync(DTOCourseFilter filterDto, CancellationToken cancellationToken = default);
        Task<DTOCourseWithLessons?> GetCourseByIdAsync(string id, CancellationToken cancellationToken = default);
        Task EnrollStudentToCourseAsync(string courseId, string studentFirebaseUid, CancellationToken cancellationToken = default);
        Task UnEnrollStudentFromCourse(string courseId, string studentFirebaseUid);
        Task<DTOCourseResponse?> GetCourseDTOByIdAsync(string courseId);
    }
}
