using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonLayer.DTOs;
using CommonLayer.Interfaces;

namespace BusinessLayer.Services
{
    public class AuthorService : IAuthorService
    {
        private IAuthorRepository _authorRepository;

        public AuthorService(IAuthorRepository authorRepository)
        {
            this._authorRepository = authorRepository; 
        }

        public async Task<bool>Register(DTORegisterAuthor author)
        {
            try 
            {
                await _authorRepository.CreateAsync(new CommonLayer.Models.Author
                {
                    FirebaseUid = author.FirebaseUid,
                    Name = author.Name,
                    Surname = author.Surname,
                    DateOfBirth = author.DateOfBirth,
                    Telephone = author.Telephone,
                    Email = author.Email
                });   
            }
            catch (Exception ex)
            {
                return false;
            }
            return true;
        }
    }
}
