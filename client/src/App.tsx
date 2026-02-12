import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import './App.css'
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import AddCoursePage from "./components/AddCoursePage";

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-course" element={<AddCoursePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
