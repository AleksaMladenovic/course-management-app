import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DificultyType, { DificultyTypeToString, type DificultyType as DificultyTypeEnum } from "../enums/DificultyType";

export interface AllCoursesFilterProps {
    name?: string;
    maxDurationInWeeks?: number;
    minDurationInWeeks?: number;
    difficulty?: DificultyTypeEnum;
    sort?: SortByOptionsType;
}

const SortByOptionsType = {
    name: 1,
    ascDuration: 2,
    descDuration: 3,
} as const;

type SortByOptionsType = typeof SortByOptionsType[keyof typeof SortByOptionsType];


const AllCoursesFilter = ({ onApplyFilter }: { onApplyFilter: (props: AllCoursesFilterProps) => void }) => {

    const [searchByName, setSearchByName] = useState<string>("");
    const [minDuration, setMinDuration] = useState<number>();
    const [maxDuration, setMaxDuration] = useState<number>();
    const [sort, setSort] = useState<SortByOptionsType>(SortByOptionsType.name);
    const [difficulty, setDifficulty] = useState<DificultyTypeEnum>();

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const nameParam = searchParams.get("name");
        const minDurationParam = searchParams.get("minDurationInWeeks");
        const maxDurationParam = searchParams.get("maxDurationInWeeks");
        const difficultyParam = searchParams.get("difficulty");
        const sortParam = searchParams.get("sort");

        if (nameParam !== null) setSearchByName(nameParam);
        if (minDurationParam !== null) setMinDuration(Number(minDurationParam));
        if (maxDurationParam !== null) setMaxDuration(Number(maxDurationParam));
        if (difficultyParam !== null && difficultyParam !== "") setDifficulty(Number(difficultyParam) as DificultyTypeEnum);
        if (sortParam !== null && sortParam !== "") setSort(Number(sortParam) as SortByOptionsType);
    }, []);

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
                <select value={difficulty ?? ""} onChange={(e) => {
                    if (e.target.value === "")
                        setDifficulty(undefined);
                    else
                        setDifficulty(Number(e.target.value) as DificultyTypeEnum)
                }
                } className="p-2 border border-gray-300 rounded w-full md:w-48">
                    <option value="">Sve težine</option>
                    <option value={DificultyType.Easy}>{DificultyTypeToString[DificultyType.Easy]}</option>
                    <option value={DificultyType.Medium}>{DificultyTypeToString[DificultyType.Medium]}</option>
                    <option value={DificultyType.Hard}>{DificultyTypeToString[DificultyType.Hard]}</option>
                </select>
                <select
                    value={sort ?? ""}
                    onChange={(e) => setSort(Number(e.target.value) as SortByOptionsType)}
                    className="p-2 border border-gray-300 rounded w-full md:w-48"
                >
                    <option value={SortByOptionsType.name}>Naziv</option>
                    <option value={SortByOptionsType.ascDuration}>Trajanje (rastuće)</option>
                    <option value={SortByOptionsType.descDuration}>Trajanje (opadajuće)</option>
                </select>
                <button className="btn bg-indigo-600 px-4 py-2 rounded font-semibold transition-all hover:bg-indigo-700"
                    onClick={() => onApplyFilter({ name: searchByName, minDurationInWeeks: minDuration, maxDurationInWeeks: maxDuration, difficulty, sort: sort })}
                >
                    Primeni filtere
                </button>
            </div>
        </div>
    );
}

export default AllCoursesFilter;