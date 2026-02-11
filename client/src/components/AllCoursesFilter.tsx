import { useEffect, useState } from "react";

export interface AllCoursesFilterProps {
    searchByName ?: string;
    minDuration ?: number;
    maxDuration ?: number;
    sortBy ?: SortByOptionsType;
}

const SortByOptionsType = {
    durationAsc: 0,
    durationDesc: 1,
} as const;

type SortByOptionsType = typeof SortByOptionsType[keyof typeof SortByOptionsType];


const AllCoursesFilter = ({ onApplyFilter}: { onApplyFilter: (props: AllCoursesFilterProps) => void }) => {
    const [searchByName, setSearchByName] = useState<string>("");
    const [minDuration, setMinDuration] = useState<number>();
    const [maxDuration, setMaxDuration] = useState<number>();
    const [sortBy, setSortBy] = useState<SortByOptionsType>();
    
    

    return (
        <div className="p-4 rounded mb-6shadow">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-4">
                <input
                    type="text"
                    value={searchByName}
                    onChange={(e) => setSearchByName(e.target.value)}
                    placeholder="Pretraži po nazivu"
                    className="p-2 border border-gray-300 rounded w-full md:w-60"
                />
                <input
                    type="number"
                    value={minDuration ?? ""}
                    onChange={(e) => setMinDuration(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Min. trajanje (ned.)"
                    className="p-2 border border-gray-300 rounded w-full md:w-40"
                    min={1}
                />
                <input
                    type="number"
                    value={maxDuration ?? ""}
                    onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Max. trajanje (ned.)"
                    className="p-2 border border-gray-300 rounded w-full md:w-40"
                    min={1}
                />
                <select
                    value={sortBy ?? ""}
                    onChange={(e) => setSortBy(e.target.value !== "" ? Number(e.target.value) as SortByOptionsType : undefined)}
                    className="p-2 border border-gray-300 rounded w-full md:w-48"
                >
                    <option value="">Sortiraj po...</option>
                    <option value={SortByOptionsType.durationAsc}>Trajanje (rastuće)</option>
                    <option value={SortByOptionsType.durationDesc}>Trajanje (opadajuće)</option>
                </select>
                <button className="btn bg-indigo-600 px-4 py-2 rounded font-semibold transition-all hover:bg-indigo-700"
                    onClick={() => onApplyFilter({ searchByName, minDuration, maxDuration, sortBy })}
                >
                    Primeni filtere
                </button>
            </div>
        </div>
    );
}

export default AllCoursesFilter;