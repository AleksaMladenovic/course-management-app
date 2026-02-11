using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Models;

namespace CommonLayer.Interfaces
{
    public interface IUserService
    {
        Task<DTOReturnLoginUserData?> LoginAsync(string firebaseUid);
    }
}