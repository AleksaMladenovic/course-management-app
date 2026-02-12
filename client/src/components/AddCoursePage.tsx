import { useState } from "react";
import type { DTOAddCourse } from "../interfaces/DTOAddCourse";
import DificultyType, { DificultyTypeToString } from "../enums/DificultyType";
import type { DificultyType as DificultyTypeEnum } from "../enums/DificultyType";
import api from "../axios";
import { getAuth } from "firebase/auth";
const AddCoursePage = () => {
    const auth = getAuth();

    const [name, setName] = useState<string>("");
    const [durationInWeeks, setDurationInWeeks] = useState<number>(1);
    const [description, setDescription] = useState<string>("");
    const [difficulty, setDifficulty] = useState<DificultyTypeEnum>(DificultyType.Easy);

    const onAddCourse = async (courseData: DTOAddCourse) =>
         {
        await api.post("Course", courseData)
        .then(response => {alert("Kurs uspešno dodat!")}); 
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddCourse({
            name,
            durationInWeeks,
            description,
            difficulty,
            authorFirebaseId: auth.currentUser?.uid || "", 
        });
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Dodaj kurs</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Naziv kursa</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trajanje (nedelje)</label>
                    <input
                        type="number"
                        min={1}
                        className="w-full border rounded px-3 py-2"
                        value={durationInWeeks}
                        onChange={e => setDurationInWeeks(Number(e.target.value))}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Opis</label>
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Težina (Difficulty)</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={difficulty}
                        onChange={e => setDifficulty(Number(e.target.value) as DificultyTypeEnum)}
                        required
                    >
                        <option value="">Izaberi...</option>
                        <option value={DificultyType.Easy}>{DificultyTypeToString[DificultyType.Easy]}</option>
                        <option value={DificultyType.Medium}>{DificultyTypeToString[DificultyType.Medium]}</option>
                        <option value={DificultyType.Hard}>{DificultyTypeToString[DificultyType.Hard]}</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Dodaj kurs
                </button>
            </form>
        </div>
    );
}

export default AddCoursePage;