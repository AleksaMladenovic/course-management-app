import { useAuth } from "../context/AuthContext";
import RoleType from "../enums/RoleType";

const MyProfile = () => {
    const { user } = useAuth();
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Moj profil</h2>
            <p><strong>Ime:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {user?.role === RoleType.Student && <p><strong>Uloga:</strong> Student</p>}
            {user?.role === RoleType.Author && <p><strong>Uloga:</strong> Autor</p>}
        </div>
    )
}

export default MyProfile;