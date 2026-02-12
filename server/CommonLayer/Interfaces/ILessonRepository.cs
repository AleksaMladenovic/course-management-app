using CommonLayer.DTOs;
using CommonLayer.Models;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CommonLayer.Interfaces
{
    public interface ILessonRepository
    {
        Task<List<Lesson>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Lesson?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task CreateAsync(Lesson lesson, CancellationToken cancellationToken = default);
        Task UpdateAsync(ObjectId id, Lesson lesson, CancellationToken cancellationToken = default);
        Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task<bool> AddLessonToCourseAsync(ObjectId courseId, DTOAddLesson lessonDto, CancellationToken cancellationToken = default);
        Task<bool> UpdateLessonAsync(ObjectId courseId, ObjectId lessonId, DTOUpdateLesson updateDto, CancellationToken cancellationToken = default);
        Task<bool> DeleteLessonAsync(ObjectId courseId, ObjectId lessonId, CancellationToken cancellationToken = default);
    }
}
