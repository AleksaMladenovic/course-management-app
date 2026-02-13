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
		Task EnrollStudentToCourse(string firebaseUid, string courseId, CancellationToken cancellationToken = default);
        Task<bool> StudentIsEnrolledToCourse(string studentFirebaseUid, string courseId, CancellationToken cancellationToken = default);
        Task UnEnrollStudentFromCourse(string studentFirebaseUid, string courseId);
        Task<List<string>> GetStudentCourses(string studentFirebaseUid, CancellationToken cancellationToken = default);
    }
}
