import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import './App.css'
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import AddCoursePage from "./components/AddCoursePage";
import CourseDetailsPage from "./components/CourseDetailsPage";
import AllCoursesFilter from "./components/AllCoursesFilter";
import AllCourses from "./components/AllCourses";
import Header from "./components/Header";

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/all-courses" element={<Header/>}/>
          <Route path="/add-course" element={<AddCoursePage />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
