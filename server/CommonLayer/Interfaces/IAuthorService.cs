using System.Threading.Tasks;
using CommonLayer.DTOs;

namespace CommonLayer.Interfaces
{
    public interface IAuthorService
    {
        Task<bool> Register(DTORegisterAuthor author);
    }
}
