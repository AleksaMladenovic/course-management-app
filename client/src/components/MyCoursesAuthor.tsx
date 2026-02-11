import { useState } from "react";
import Pagination from "./Pagination";

const MyCoursesAuthor = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 25; // Ovo bi trebalo da bude dinamički dobijeno sa backend-a
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Moji kursevi Autor</h2>


            <div className="mt-4 p-4 bg-slate-700 rounded">
                <h3 className="text-xl font-semibold">Kurs {currentPage}</h3>
                <p>Opis kursa {currentPage}...</p>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    )
}

export default MyCoursesAuthor;