using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.Models;

namespace CommonLayer.Interfaces
{
    public interface IStudentRepository
    {
        Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Student?> GetByIdAsync(string firebaseUid, CancellationToken cancellationToken = default);
        Task CreateAsync(Student student, CancellationToken cancellationToken = default);
        Task UpdateAsync(string firebaseUid, Student student, CancellationToken cancellationToken = default);
        Task DeleteAsync(string firebaseUid, CancellationToken cancellationToken = default);
    }
}
