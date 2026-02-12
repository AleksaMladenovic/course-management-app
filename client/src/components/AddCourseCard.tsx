import { useNavigate } from "react-router-dom";

const AddCourseCard = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/add-course");
    };
    return (
        <div className="border rounded p-4 shadow hover:shadow-lg transition-shadow flex flex-col justify-center cursor-pointer"
            onClick={handleClick}>

            <h2 className="text-xl font-bold">Dodaj novi kurs</h2>
        </div>
    )
}

export default AddCourseCard;