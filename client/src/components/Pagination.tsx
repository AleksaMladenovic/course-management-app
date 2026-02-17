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
        <div className="flex justify-center items-center gap-2 my-8">
            {/* Previous dugme */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="previous-button h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 transition-all hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                &lt;
            </button>

            {/* Brojevi stranica */}
            {paginationItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => typeof item === "number" && onPageChange(item)}
                    disabled={typeof item === "string"}
                    className={`page-button h-10 min-w-[2.5rem] px-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        currentPage === item
                            ? "bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                            : typeof item === "string"
                            ? "cursor-default text-gray-500"
                            : "border border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                >
                    {item}
                </button>
            ))}

            {/* Next dugme */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="next-button h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 transition-all hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                &gt;
            </button>
        </div>
    );
}

export default Pagination;