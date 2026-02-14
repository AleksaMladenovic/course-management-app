using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.Models;

namespace CommonLayer.Interfaces
{
    public interface IAuthorRepository
    {
        Task<List<Author>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Author?> GetByIdAsync(string firebaseUid, CancellationToken cancellationToken = default);
        Task CreateAsync(Author author, CancellationToken cancellationToken = default);
        Task UpdateAsync(string firebaseUid, Author author, CancellationToken cancellationToken = default);
        Task DeleteAsync(string firebaseUid, CancellationToken cancellationToken = default);
        Task AddCourseToAuthorAsync(string firebaseUid, string courseId, CancellationToken cancellationToken = default);
        List<string> GetCoursesByAuthorIdAsync(string authorFirebaseUid);
        Task<List<string>> GetCoursesByAuthorIdAsync(string authorFirebaseUid, CancellationToken cancellationToken = default);
    }
}
