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

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/all-courses" element={
            <ProtectedRoute>
              <Header />
            </ProtectedRoute>
          }/>
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
