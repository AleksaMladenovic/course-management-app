namespace CommonLayer.DTOs
{
    public class DTOLessonResponse
    {
        public string Id {  get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int DurationInMinutes {  get; set; }
        public string Description { get; set; } = string.Empty;
    }
}