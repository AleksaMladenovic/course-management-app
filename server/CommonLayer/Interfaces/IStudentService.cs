using System.Threading.Tasks;
using CommonLayer.DTOs;

namespace CommonLayer.Interfaces
{
    public interface IStudentService
    {
        Task<bool> Register(DTORegisterStudent student);
    }
}
