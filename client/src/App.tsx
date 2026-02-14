import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import './App.css'
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import AddCoursePage from "./components/AddCoursePage";
import CourseDetailsPage from "./components/CourseDetailsPage";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import AllCourses from "./components/AllCourses";
import MyCoursesStudent from "./components/MyCoursesStudent";
import MyCoursesAuthor from "./components/MyCoursesAuthor";
import MyProfile from "./components/MyProfile";
import { useAuth } from "./context/AuthContext";
import RoleType from "./enums/RoleType";

const MyCoursesRoute = () => {
  const { user } = useAuth();

  if (user?.role === RoleType.Author) {
    return <MyCoursesAuthor />;
  }

  if (user?.role === RoleType.Student) {
    return <MyCoursesStudent />;
  }

  return null;
};

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Header />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllCourses />} />
            <Route path="my" element={<MyCoursesRoute />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
          <Route path="/add-course" element={
            <ProtectedRoute>
              <AddCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/course/:id" element={
            <ProtectedRoute>
              <CourseDetailsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
