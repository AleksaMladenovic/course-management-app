import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import RoleType from "../enums/RoleType";
import AllCourses from "./AllCourses";
import MyCoursesStudent from "./MyCoursesStudent";
import MyCoursesAuthor from "./MyCoursesAuthor";
import MyProfile from "./MyProfile";

type ViewType = "allCourses" | "myCourses" | "profile";
type AuthorViewType = "allCourses" | "myCourses" | "profile";

const Header = () => {
    const { user } = useAuth();
    const [studentView, setStudentView] = useState<ViewType>("allCourses");
    const [authorView, setAuthorView] = useState<AuthorViewType>("myCourses");

    const handleStudentViewChange = (view: ViewType) => {
        setStudentView(view);
    };

    const handleAuthorViewChange = (view: AuthorViewType) => {
        setAuthorView(view);
    };

    return (
        <>
            <header className="bg-[#1f366b] py-2 px-6 rounded-xl">
                {/* Dugmići za Student */}
                {user?.role === RoleType.Student && (
                    <div className="flex gap-3 justify-between">
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStudentViewChange("allCourses")}
                                className={`px-4 py-2 rounded font-semibold transition-all ${studentView === "allCourses"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                                    }`}
                            >
                                Svi kursevi
                            </button>
                            <button
                                onClick={() => handleStudentViewChange("myCourses")}
                                className={`px-4 py-2 rounded font-semibold transition-all ${studentView === "myCourses"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                                    }`}
                            >
                                Moji kursevi
                            </button>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg" title={`${user.name} ${user.surname}`}
                            onClick={() => handleStudentViewChange("profile")}
                        >
                            <span className="text-white font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                )}

                {/* Dugmići za Author */}
                {user?.role === RoleType.Author && (
                    <div className="flex gap-3 justify-between">
                        <div className="flex gap-3">

                            <button
                                onClick={() => handleAuthorViewChange("allCourses")}
                                className={`px-4 py-2 rounded font-semibold transition-all ${authorView === "allCourses"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                                    }`}
                            >
                                Svi kursevi
                            </button>
                            <button
                                onClick={() => handleAuthorViewChange("myCourses")}
                                className={`px-4 py-2 rounded font-semibold transition-all ${authorView === "myCourses"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                                    }`}
                            >
                                Moji kursevi
                            </button>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg" title={`${user.name} ${user.surname}`}
                            onClick={() => handleAuthorViewChange("profile")}
                        >
                            <span className="text-white font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                )}
            </header>

            {/* Prikazi na osnovu selektovane kartice */}
            <div className="p-6">
                {user?.role === RoleType.Student && (
                    <>
                        {studentView === "allCourses" && (
                            <AllCourses />
                        )}
                        {studentView === "myCourses" && (
                            <MyCoursesStudent />
                        )}
                        {studentView === "profile" && (
                            <MyProfile />
                        )}
                    </>
                )}

                {user?.role === RoleType.Author && (
                    <>
                        {authorView === "allCourses" && (
                            <AllCourses />
                        )}
                        {authorView === "myCourses" && (
                            <MyCoursesAuthor />
                        )}
                        {authorView === "profile" && (
                            <MyProfile />
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Header;