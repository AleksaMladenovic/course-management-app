const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
    const getPaginationItems = () => {
        const items: (number | string)[] = [];
        const range = 1; // Prikaži 1 stranicu +/- od trenutne

        // Uvek dodaj prvu stranicu
        items.push(1);

        // Ako je razmak između 1 i (currentPage - range), dodaj ...
        if (currentPage - range > 2) {
            items.push("...");
        }

        // Dodaj stranice oko trenutne
        for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
            if (!items.includes(i)) {
                items.push(i);
            }
        }

        // Ako je razmak između (currentPage + range) i poslednje stranice, dodaj ...
        if (currentPage + range < totalPages - 1) {
            items.push("...");
        }

        // Uvek dodaj poslednju stranicu (ako ima više od 1)
        if (totalPages > 1) {
            items.push(totalPages);
        }

        return items;
    };

    const paginationItems = getPaginationItems();

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            {/* Previous dugme */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
                &lt;
            </button>

            {/* Brojevi stranica */}
            {paginationItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => typeof item === "number" && onPageChange(item)}
                    disabled={typeof item === "string"}
                    className={`px-3 py-2 rounded font-semibold transition-all ${
                        currentPage === item
                            ? "bg-indigo-600 text-white shadow-lg"
                            : typeof item === "string"
                            ? "cursor-default text-slate-400"
                            : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    }`}
                >
                    {item}
                </button>
            ))}

            {/* Next dugme */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
                &gt;
            </button>
        </div>
    );
}

export default Pagination;