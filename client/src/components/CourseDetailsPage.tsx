import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { DTOCourseWithLessons } from "../interfaces/DTOCourseWithLessons";
import api from "../axios";
import { DificultyTypeToString, type DificultyType } from "../enums/DificultyType";
import type { DTOAddLesson } from "../interfaces/DTOAddLesson";
import { useAuth } from "../context/AuthContext";
import {
    Clock,
    BarChart,
    User,
    BookOpen,
    ChevronLeft,
    Edit3,
    PlayCircle,
    Trash2,
    AlertCircle,
    Check,
    X,
    Save,
    Lock,
    Layers,
    LogOut,
    Plus, // Dodato
    Pencil, // Dodato
    Signal
} from "lucide-react";
import { getAuth } from "firebase/auth";
import RoleType from "../enums/RoleType";

interface EditCourseForm {
    name: string;
    description: string;
    durationInWeeks: number;
    difficulty: DificultyType;
}



const CourseDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<DTOCourseWithLessons>();
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false);

    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // State-ovi za lekcije
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [lessonForm, setLessonForm] = useState<DTOAddLesson>({ name: "", description: "", durationInMinutes: 0 });
    const [selectedLessonForView, setSelectedLessonForView] = useState<any>(null);
    const [lessonErrors, setLessonErrors] = useState({
        name: "",
        description: "",
        durationInMinutes: ""
    });

    const [editForm, setEditForm] = useState<EditCourseForm>({
        name: "",
        description: "",
        durationInWeeks: 0,
        difficulty: 0 as DificultyType
    });
    const [editErrors, setEditErrors] = useState({
        name: "",
        description: "",
        durationInWeeks: "",
        difficulty: ""
    });

    const { user } = useAuth();
    const auth = getAuth();

    const fetchData = async () => {
        try {
            const res = await api.get(`/Course/getById/${id}`);
            const result: DTOCourseWithLessons = res.data;
            setCourse(result);
            setEditForm({
                name: result.name,
                description: result.description,
                durationInWeeks: result.durationInWeeks,
                difficulty: result.difficulty
            });

            if (auth.currentUser?.uid && user?.role === RoleType.Student) {
                const enrollStatus = await api.get(`/Student/StudentIsEnrolledToCourse/${auth.currentUser.uid}/${id}`);
                setIsEnrolled(enrollStatus.data);
            }
        } catch (error) {
            setErrorMessage("Greška pri učitavanju kursa. Kurs možda ne postoji ili je došlo do problema na serveru.");
            console.error("Greška pri učitavanju", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, auth.currentUser, user?.role]);

    const isOwner = auth.currentUser?.uid === course?.author.authorFirebaseId;
    const isStudent = user?.role === RoleType.Student;
    const showSidebar = isStudent && !isOwner;

    // --- LEKCIJE: BACKEND AKCIJE ---

    const handleAddLesson = async () => {
        if (!validateLessonForm()) {
            return;
        }
        try {
            await api.post(`/Lessons/addLesson/${course?.id}`, lessonForm);
            alert("Lekcija uspešno dodata!");
            setIsAddingLesson(false);
            setLessonForm({ name: "", description: "", durationInMinutes: 0 });
            setLessonErrors({ name: "", description: "", durationInMinutes: "" });
            fetchData(); // Osveži listu
        } catch (error: any) {
            alert(error.response?.data || "Greška pri dodavanju lekcije.");
        }
    };

    const handleUpdateLesson = async () => {
        if (isChangingLessonSameAsOriginal()) {
            setEditingLessonId(null);
            setLessonForm({ name: "", description: "", durationInMinutes: 0 });
            setLessonErrors({ name: "", description: "", durationInMinutes: "" });
            return;
        }
        if (!validateLessonForm()) {
            return;
        }
        if (!editingLessonId) return;
        try {
            await api.put(`/Lessons/updateLesson/${id}/${editingLessonId}`, lessonForm);
            alert("Lekcija uspešno ažurirana!");
            setEditingLessonId(null);
            setLessonForm({ name: "", description: "", durationInMinutes: 0 });
            setLessonErrors({ name: "", description: "", durationInMinutes: "" });
            fetchData();
        } catch (error) {
            alert("Greška pri izmeni lekcije.");
        }
    };

    const isChangingLessonSameAsOriginal = () => {
        if (!editingLessonId || !course) return true;
        const originalLesson = course.lessons.find(lesson => lesson.id === editingLessonId);
        if (!originalLesson) return true;
        return lessonForm.name === originalLesson.name &&
            lessonForm.description === originalLesson.description &&
            lessonForm.durationInMinutes === originalLesson.durationInMinutes;
    }
    const handleDeleteLesson = async (lessonId: string) => {
        if (!window.confirm("Da li sigurno želite da obrišete ovu lekciju?")) return;
        try {
            await api.delete(`/Lessons/deleteLesson/${id}/${lessonId}`);
            fetchData();
        } catch (error) {
            alert("Greška pri brisanju lekcije.");
        }
    };

    const startEditingLesson = (lesson: any) => {
        setEditingLessonId(lesson.id);
        setLessonForm({ name: lesson.name, description: lesson.description, durationInMinutes: lesson.durationInMinutes });
        setLessonErrors({ name: "", description: "", durationInMinutes: "" });
    };

    const handleEnroll = async () => { /* ... isti kod kao pre ... */
        if (!auth.currentUser) return;
        setIsActionLoading(true);
        try {
            await api.post(`/Student/EnrollStudentToCourse/${auth.currentUser.uid}/${id}`);
            setIsEnrolled(true);
            alert("Uspešno ste se upisali!");
        } catch (error) { alert("Greška pri upisu."); } finally { setIsActionLoading(false); }
    };

    const handleUnenroll = async () => {
        if (!auth.currentUser || !window.confirm("Ispis sa kursa?")) return;
        setIsActionLoading(true);
        try {
            await api.post(`/Student/UnEnrollStudentFromCourse/${auth.currentUser.uid}/${id}`);
            setIsEnrolled(false);
            alert("Ispisani ste sa kursa.");
        } catch (error) { alert("Greška pri ispisu."); } finally { setIsActionLoading(false); }
    };

    const handleUpdate = async () => {
        try {
            if (editIsSameAsOriginal()) {
                setIsEditingMode(false);
                return;
            }
            if (!validateEditForm()) {
                return;
            }
            await api.put(`/Course/updateCourse/${id}`, editForm);
            setCourse(prev => prev ? { ...prev, ...editForm } : prev);
            setIsEditingMode(false);
            setEditErrors({ name: "", description: "", durationInWeeks: "", difficulty: "" });
            alert("Kurs je uspešno ažuriran.");
        } catch (error) { alert("Greška prilikom čuvanja."); }
    };

    const editIsSameAsOriginal = () => {
        return editForm.name === course?.name &&
            editForm.description === course?.description &&
            editForm.durationInWeeks === course?.durationInWeeks &&
            editForm.difficulty === course?.difficulty;
    }

    const validateLessonForm = () => {
        const newErrors = {
            name: "",
            description: "",
            durationInMinutes: ""
        };

        if (!lessonForm.name.trim()) {
            newErrors.name = "Naziv lekcije je obavezan.";
        } else if (lessonForm.name.length < 3 || lessonForm.name.length > 50) {
            newErrors.name = "Naziv lekcije mora biti između 3 i 50 karaktera.";
        }

        if (!lessonForm.description.trim()) {
            newErrors.description = "Opis lekcije je obavezan.";
        } else if (lessonForm.description.length < 20 || lessonForm.description.length > 2000) {
            newErrors.description = "Opis lekcije mora biti između 20 i 2000 karaktera.";
        }

        if (lessonForm.durationInMinutes < 1 || lessonForm.durationInMinutes > 600) {
            newErrors.durationInMinutes = "Trajanje lekcije mora biti između 1 i 600 minuta.";
        }

        setLessonErrors(newErrors);
        return Object.values(newErrors).every(value => value === "");
    };

    const validateEditForm = () => {
        const newErrors = {
            name: "",
            description: "",
            durationInWeeks: "",
            difficulty: ""
        };

        if (!editForm.name.trim()) {
            newErrors.name = "Naziv kursa je obavezan.";
        } else if (editForm.name.length < 3 || editForm.name.length > 50) {
            newErrors.name = "Naziv kursa mora biti između 3 i 50 karaktera.";
        }

        if (!editForm.description.trim()) {
            newErrors.description = "Opis kursa je obavezan.";
        } else if (editForm.description.length < 20 || editForm.description.length > 2000) {
            newErrors.description = "Opis kursa mora biti između 20 i 2000 karaktera.";
        }

        if (editForm.durationInWeeks < 1 || editForm.durationInWeeks > 52) {
            newErrors.durationInWeeks = "Trajanje kursa mora biti između 1 i 52 nedelje.";
        }

        setEditErrors(newErrors);
        return Object.values(newErrors).every(value => value === "");
    };
    const handleDelete = async () => {
        if (!window.confirm("Obrisati kurs?")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/Course/deleteCourse/${id}`);
            navigate("/courses");
        } catch (error) { alert("Greška pri brisanju."); } finally { setIsDeleting(false); }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen bg-[#0b0f1a]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div></div>;
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-[#0b0f1a] text-gray-100 flex items-center justify-center px-6">
                <div className="max-w-xl w-full bg-[#141b2d] border border-white/10 rounded-[2rem] p-10 text-center shadow-2xl">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 mx-auto mb-6">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-widest mb-3">Greška</h2>
                    <p className="text-gray-400 leading-relaxed mb-8">{errorMessage}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black uppercase text-xs tracking-widest transition-all"
                    >
                        Vrati se nazad
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f1a] text-gray-100 pb-24 font-sans selection:bg-blue-500/30">
            {/* HERO SECTION - (Ostaje isti dizajn kao pre) */}
            <div className="bg-[#141b2d] border-b border-white/5 relative overflow-hidden pt-12 pb-16">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-blue-400 mb-10 group transition-all uppercase tracking-widest"><ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform mr-2" /> Nazad</button>
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                        <div className="flex-1 space-y-6">
                            {isEditingMode ? (
                                <div className="space-y-2">
                                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-4xl font-black text-white focus:border-blue-500 outline-none" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                    {editErrors.name && (
                                        <label className="text-red-500 text-sm font-bold ml-1">{editErrors.name}</label>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-1 rounded-lg text-[10px] font-black bg-blue-500 text-white uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">{course ? DificultyTypeToString[course.difficulty] : ""}</span>
                                        {isOwner && <span className="owner-span text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">Vaš Kurs</span>}
                                    </div>
                                    <h1 className="course-name w-full text-left text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                        {course?.name}
                                    </h1>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-y-4 gap-x-10 pt-6 border-t border-white/5">
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20"><Clock size={20} />
                                        </div>
                                        {!isEditingMode ? (
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Trajanje</p>
                                                <p className="course-duration-value text-sm font-bold">{course?.durationInWeeks} nedelja</p>
                                            </div>
                                        ) :
                                            (
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Trajanje</p>
                                                    <div className="flex items-center gap-2">
                                                        <input className="course-duration-input w-11 h-10 text-center bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white focus:border-blue-500 outline-none" type="number" value={editForm.durationInWeeks} onChange={(e) => setEditForm({ ...editForm, durationInWeeks: Number(e.target.value) })} />
                                                        <p className="text-sm font-bold">nedelja</p>
                                                    </div>
                                                    {editErrors.durationInWeeks && (
                                                        <label className="text-red-500 text-sm font-bold ml-1">{editErrors.durationInWeeks}</label>
                                                    )}
                                                </div>
                                            )
                                        }


                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Lekcije</p>
                                            <p className="number-of-lessons text-sm font-bold">{course?.lessons?.length || 0} lekcija</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Autor</p>
                                            <p className="author-name text-sm font-bold">{course?.author.name} {course?.author.surname}</p>
                                        </div>
                                    </div>
                                    {isEditingMode && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                                                <Signal size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Težina</p>
                                                <select className="select-difficulty w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white outline-none focus:border-blue-500" value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: Number(e.target.value) as DificultyType })}>
                                                    {Object.entries(DificultyTypeToString).map(([key, value]) => (
                                                        <option key={key} value={key} selected={editForm.difficulty.toString() === key} className="bg-[#141b2d] text-gray-200">
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </>
                            </div>

                        </div>
                        {isOwner && (
                            <div className="flex gap-4 mb-2">
                                {isEditingMode ? (
                                    <><button onClick={handleUpdate} className="handle-update flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20"><Save size={18} />
                                        Sačuvaj
                                    </button>
                                        <button onClick={() => setIsEditingMode(false)} className="cancel-update flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl transition-all font-black uppercase text-xs tracking-widest"><X size={18} />
                                            Odustani
                                        </button></>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditingMode(true)} className="update-button flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-2xl transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-white/10"><Edit3 size={18} />
                                            Uredi
                                        </button>
                                        <button onClick={handleDelete} disabled={isDeleting} className="delete-button border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white px-8 py-4 rounded-2xl transition-all font-black uppercase text-xs tracking-widest">
                                            <Trash2 size={18} />
                                        </button></>
                                )}
                            </div>
                        )}
                    </div>
                </div >
            </div >

            <main className={`max-w-[1400px] mx-auto px-6 md:px-12 mt-16 grid grid-cols-1 ${showSidebar ? 'xl:grid-cols-3' : 'grid-cols-1'} gap-16`}>
                <div className={showSidebar ? "xl:col-span-2 space-y-20" : "w-full space-y-20"}>
                    <section>
                        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-[0.2em] mb-8 border-l-4 border-blue-500 pl-4">Pregled Kursa</h2>
                        <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                            {isEditingMode ? (
                                <div className="space-y-2">
                                    <textarea className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 text-gray-300 min-h-[300px] outline-none focus:border-blue-500 text-lg font-light leading-relaxed" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                    {editErrors.description && (
                                        <label className="text-red-500 text-sm font-bold ml-1">{editErrors.description}</label>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 leading-loose text-xl font-light">{course?.description}</p>
                            )}
                        </div>
                    </section>

                    {/* LEKCIJE SEKCIJA */}
                    <section className="space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 border-l-4 border-emerald-500 pl-4">Lekcije {(isOwner || isEnrolled) && <Check size={18} className="text-emerald-500" />}</h2>
                            {isOwner && !isAddingLesson && !editingLessonId && (
                                <button onClick={() => setIsAddingLesson(true)} className="add-lesson-button flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                                    <Plus size={14} /> Dodaj Lekciju
                                </button>
                            )}
                        </div>

                        {/* FORMA ZA DODAVANJE / IZMENU LEKCIJE (SAMO VLASNIK) */}
                        {(isAddingLesson || editingLessonId) && (
                            <div className="bg-white/[0.03] border border-blue-500/30 p-8 rounded-[2rem] space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">{editingLessonId ? "Izmena Lekcije" : "Nova Lekcija"}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Naslov</label>
                                        <input className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" value={lessonForm.name} onChange={(e) => setLessonForm({ ...lessonForm, name: e.target.value })} />
                                        {lessonErrors.name && (
                                            <label className="text-red-500 text-sm font-bold ml-1">{lessonErrors.name}</label>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trajanje (min)</label>
                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" value={lessonForm.durationInMinutes} onChange={(e) => setLessonForm({ ...lessonForm, durationInMinutes: parseInt(e.target.value) })} />
                                        {lessonErrors.durationInMinutes && (
                                            <label className="text-red-500 text-sm font-bold ml-1">{lessonErrors.durationInMinutes}</label>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opis lekcije</label>
                                    <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 min-h-[100px]" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} />
                                    {lessonErrors.description && (
                                        <label className="text-red-500 text-sm font-bold ml-1">{lessonErrors.description}</label>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        onClick={() => { setIsAddingLesson(false); setEditingLessonId(null); setLessonForm({ name: "", description: "", durationInMinutes: 0 }); setLessonErrors({ name: "", description: "", durationInMinutes: "" }); }}
                                        className="cancel-lesson-button text-xs font-bold text-gray-500 px-4 py-2">
                                        Odustani
                                    </button>
                                    <button
                                        onClick={editingLessonId ? handleUpdateLesson : handleAddLesson}
                                        className="save-lesson-button bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                        {editingLessonId ? "Sačuvaj izmene" : "Potvrdi"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* LISTA LEKCIJA */}
                        {(isOwner || isEnrolled) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course?.lessons?.map((lesson, index) => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => setSelectedLessonForView(lesson)}
                                        className="lesson-div group flex items-center justify-between bg-white/[0.03] p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer" // Promenjen cursor i hover
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all"><PlayCircle size={24} /></div>
                                            <div>
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">
                                                    Lekcija {index + 1}</span>
                                                <h3 className="lesson-name font-bold text-white text-lg">{lesson.name}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="lesson-duration text-xs font-mono text-gray-500">{lesson.durationInMinutes} min</span>
                                            {isOwner && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            startEditingLesson(lesson);
                                                        }}
                                                        className="edit-lesson-button p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteLesson(lesson.id);
                                                        }}
                                                        className="delete-lesson-button p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!course?.lessons || course.lessons.length === 0) && (
                                    <div className="md:col-span-2 text-center py-20 bg-white/[0.01] rounded-[3rem] border-2 border-dashed border-white/5">
                                        <BookOpen size={48} className="mx-auto text-gray-700 mb-6" />
                                        <h4 className="no-content-label text-xl font-bold text-gray-500 uppercase tracking-widest">Nema sadržaja</h4>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-navy/40 border border-white/5 rounded-[3rem] p-16 text-center">
                                <Lock size={40} className="mx-auto text-white/10 mb-6" />
                                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">
                                    Sadržaj je privatan
                                </h3>
                                <p className="text-gray-500 font-light max-w-sm mx-auto">
                                    Upisom na kurs otključaćete lekcije.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* SIDEBAR - (Ostaje isti kao pre) */}
                {showSidebar && (
                    <aside className="relative">
                        <div className="bg-[#141b2d] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-12">
                            <h3 className="text-lg font-black text-white mb-8 tracking-widest uppercase text-center">{isEnrolled ? "Vaš Status" : "Upis Kursa"}</h3>
                            <div className="space-y-2 mb-10">
                                <div className="flex justify-between items-center py-4 border-b border-white/5 group/item"><div className="flex items-center gap-3"><BarChart size={16} className="text-blue-500" /><span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nivo</span></div><span className="text-[11px] font-bold text-white uppercase bg-white/5 px-2 py-1 rounded">{course ? DificultyTypeToString[course.difficulty] : "/"}</span></div>
                                <div className="flex justify-between items-center py-4 border-b border-white/5 group/item"><div className="flex items-center gap-3"><BookOpen size={16} className="text-emerald-500" /><span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Sadržaj</span></div><span className="text-xs font-bold text-white uppercase">{course?.lessons?.length || 0} Lekcija</span></div>
                                <div className="flex justify-between items-center py-4 border-b border-white/5 group/item"><div className="flex items-center gap-3"><Clock size={16} className="text-purple-500" /><span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Tempo</span></div><span className="text-xs font-bold text-white uppercase">{course?.durationInWeeks} Nedelja</span></div>
                            </div>
                            {isEnrolled ? (
                                <button
                                    onClick={handleUnenroll}
                                    disabled={isActionLoading}
                                    className="unenroll-button w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                                    <LogOut size={16} />
                                    {isActionLoading ? "Ispis..." : "Ispiši se sa kursa"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={isActionLoading}
                                    className="enroll-button w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                                    <Check size={16} />
                                    {isActionLoading ? "Upis..." : "Upis na Kurs"}
                                </button>
                            )}
                        </div>
                    </aside>
                )}

                {/* MODAL ZA PREGLED DETALJA LEKCIJE */}
                {selectedLessonForView && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        {/* Pozadina (Backdrop) */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedLessonForView(null)}
                        />

                        {/* Sadržaj Modala */}
                        <div className="lesson-modal relative bg-[#141b2d] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />

                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Pregled Modula</span>
                                        <h2 className="lesson-name text-3xl font-black text-white mt-2 uppercase tracking-tighter">
                                            {selectedLessonForView.name}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLessonForView(null)}
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 py-4 border-y border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} className="text-blue-500" />
                                        <span className="lesson-duration text-sm font-bold text-gray-300">{selectedLessonForView.durationInMinutes} minuta</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opis Sadržaja</h4>
                                    <p className="lesson-description text-gray-400 leading-loose text-lg font-light italic">
                                        "{selectedLessonForView.description || "Nema dodatnog opisa za ovu lekciju."}"
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedLessonForView(null)}
                                    className="close-lesson-modal w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs"
                                >
                                    Zatvori pregled
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}

export default CourseDetailsPage;