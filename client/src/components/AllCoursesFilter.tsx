import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DificultyType, { DificultyTypeToString, type DificultyType as DificultyTypeEnum } from "../enums/DificultyType";
import {
    Search,
    Clock,
    BarChart,
    SortAsc,
    Filter,
    ChevronDown,
    RefreshCcw,
    ChevronUp
} from "lucide-react"; // Instaliraj ako nisi: npm install lucide-react

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
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
    }, [searchParams]);

    const handleClear = () => {
        setSearchByName("");
        setMinDuration(undefined);
        setMaxDuration(undefined);
        setDifficulty(undefined);
        setSort(SortByOptionsType.name);
        onApplyFilter({ name: "", sort: SortByOptionsType.name });
    };

    return (
        <div className="w-full bg-[#141b2d]/50 backdrop-blur-xl border border-white/5 py-4 px-8 rounded-[2.5rem] shadow-2xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className={"flex items-center justify-between gap-4" + (isCollapsed ? " mb-2" : " mb-8")}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/90">Filteri Pretrage</h2>
                </div>

                <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:border-white/20 hover:text-white"
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "Prikazi filtere" : "Sakrij filtere"}
                >
                    {isCollapsed ? "Prikaži" : "Sakrij"}
                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

                        {/* PRETRAGA PO NAZIVU */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={searchByName}
                                onChange={(e) => setSearchByName(e.target.value)}
                                placeholder="Naziv kursa..."
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                        </div>

                        {/* MIN TRAJANJE */}
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input
                                type="number"
                                value={minDuration ?? ""}
                                onChange={(e) => setMinDuration(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="Min. nedelja"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>

                        {/* MAX TRAJANJE */}
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input
                                type="number"
                                value={maxDuration ?? ""}
                                onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="Max. nedelja"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>

                        {/* TEŽINA */}
                        <div className="relative group">
                            <BarChart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                            <select
                                value={difficulty ?? ""}
                                onChange={(e) => setDifficulty(e.target.value === "" ? undefined : Number(e.target.value) as DificultyTypeEnum)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm text-white outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#141b2d]">Sve težine</option>
                                <option value={DificultyType.Easy} className="bg-[#141b2d]">{DificultyTypeToString[DificultyType.Easy]}</option>
                                <option value={DificultyType.Medium} className="bg-[#141b2d]">{DificultyTypeToString[DificultyType.Medium]}</option>
                                <option value={DificultyType.Hard} className="bg-[#141b2d]">{DificultyTypeToString[DificultyType.Hard]}</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                        </div>

                        {/* SORTIRANJE */}
                        <div className="relative group">
                            <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <select
                                value={sort ?? ""}
                                onChange={(e) => setSort(Number(e.target.value) as SortByOptionsType)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value={SortByOptionsType.name} className="bg-[#141b2d]">Naziv A-Z</option>
                                <option value={SortByOptionsType.ascDuration} className="bg-[#141b2d]">Trajanje (Rastuće)</option>
                                <option value={SortByOptionsType.descDuration} className="bg-[#141b2d]">Trajanje (Opadajuće)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* AKCIJE */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-4 pt-2 border-t border-white/5">
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors py-2 px-4"
                        >
                            <RefreshCcw size={14} /> Resetuj
                        </button>
                        <button
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-[10px] active:scale-95"
                            onClick={() => onApplyFilter({
                                name: searchByName,
                                minDurationInWeeks: minDuration,
                                maxDurationInWeeks: maxDuration,
                                difficulty,
                                sort: sort
                            })}
                        >
                            Primeni filtere
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AllCoursesFilter;