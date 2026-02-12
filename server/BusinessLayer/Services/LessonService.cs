using CommonLayer.DTOs;
using CommonLayer.Interfaces;
using MongoDB.Bson;

namespace BusinessLayer.Services
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ICourseRepository _courseRepository;

        public LessonService(ILessonRepository lessonRepository, ICourseRepository courseRepository)
        {
            _lessonRepository = lessonRepository;
            _courseRepository = courseRepository;
        }

        public async Task<bool> AddLessonToCourseAsync(string courseId, DTOAddLesson dto)
        {
            if (!ObjectId.TryParse(courseId, out var objCourseId))
            {
                throw new ArgumentException("ID kursa nije u ispravnom formatu.");
            }

            var course = await _courseRepository.GetByIdAsync(objCourseId);
            if (course == null)
            {
                throw new KeyNotFoundException("Kurs sa tim ID-jem ne postoji.");
            }

            var isAdded = await _lessonRepository.AddLessonToCourseAsync(objCourseId, dto);

            return isAdded;
        }
    }
}