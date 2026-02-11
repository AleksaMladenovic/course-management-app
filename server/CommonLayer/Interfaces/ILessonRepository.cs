using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.Models;
using MongoDB.Bson;

namespace CommonLayer.Interfaces
{
    public interface ILessonRepository
    {
        Task<List<Lesson>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Lesson?> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task CreateAsync(Lesson lesson, CancellationToken cancellationToken = default);
        Task UpdateAsync(ObjectId id, Lesson lesson, CancellationToken cancellationToken = default);
        Task DeleteAsync(ObjectId id, CancellationToken cancellationToken = default);
    }
}
