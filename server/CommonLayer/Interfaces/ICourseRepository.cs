using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
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
    }
}
