using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;

namespace BusinessLayer.Services
{
    public class AuthorService
    {
        private IAuthorRepository _authorRepository;

        public AuthorService(IAuthorRepository authorRepository)
        {
            this._authorRepository = authorRepository; 
        }

        public Task<bool>Register(DTORegisterAuthor author)
        {
            
        }
    }
}
