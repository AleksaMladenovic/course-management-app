using System.Threading.Tasks;
using CommonLayer.DTOs;
namespace CommonLayer.Interfaces
{
    public interface IStudentService
    {
        Task<bool> Register(DTORegisterStudent student);
        Task<bool> StudentIsEnrolledToCourse(string studentFirebaseUid, string courseId);
        Task EnrollStudentToCourse(string studentFirebaseUid, string courseId);
        Task UnEnrollStudentFromCourse(string studentFirebaseUid, string courseId);
        Task<List<DTOCourseResponse>> GetStudentCourses(string studentFirebaseUid);
        Task<DTOStudentsStats> GetStudentStats(string studentFirebaseUid);
    }
}
