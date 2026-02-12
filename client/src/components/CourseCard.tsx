import { useNavigate } from "react-router-dom";
import { DificultyTypeToString, type DificultyType } from "../enums/DificultyType";

export interface CourseCardProps {
    id: string;
    name: string;
    durationInWeeks: number;
    dificulty: DificultyType;
    authorName: string;
    authorSurname: string;
    authorId: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ id, name, durationInWeeks, dificulty, authorName, authorSurname, authorId }) => {
    const navigate = useNavigate();
    
    const onMoreDetailsClick = () => {
        navigate(`/course/${id}`);
    }

    return <div className="border rounded p-4 shadow hover:shadow-lg transition-shadow flex flex-col justify-between">
        <h2 className="text-xl font-bold">{name}</h2>
        <p>Trajanje: {durationInWeeks} nedelja</p>
        <p>Težina: {DificultyTypeToString[dificulty]}</p>
        {/* TODO: Dodati link ka profilu autora */}
        <p>Autor: {authorName} {authorSurname}</p>
        <button onClick={onMoreDetailsClick} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Više detalja
        </button>
    </div>

}

export default CourseCard;


