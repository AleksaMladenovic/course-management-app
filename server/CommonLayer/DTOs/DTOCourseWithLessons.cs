namespace CommonLayer.DTOs
{
    public class DTOCourseWithLessons : DTOCourseResponse
    {
        public List<DTOLessonResponse> Lessons { get; set; } = new List<DTOLessonResponse>();
    }
}