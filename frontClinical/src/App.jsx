import React, { useContext } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { Router, Route, Routes } from "react-router-dom";
import PatientProfile from "./pages/PatientProfile";
import About from "./pages/About";
import QRScanner from "./components/QRScanner";
import DoctorDashboard from "./pages/DoctorDashboard";
import UpdatePatientData from "./pages/UpdatePatientData";
import Appointments from "./pages/Appointments";
import MedicalRecord from "./pages/MedicalRecord";
import DailyPlan from "./pages/Dailyplan";
import VideoRoom from "./pages/VideoRoom";
import { ThemeContext } from "./context/ThemeContext";
import Footer from "./components/Footer";

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`overflow-hidden ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/medical-record/:id" element={<MedicalRecord />} />
        <Route path="/doctor/:secretCode" element={<DoctorDashboard />} />
        <Route path="/patient/user/:userId" element={<PatientProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/updatePatientData" element={<UpdatePatientData />} />
        <Route path="/daily-plan" element={<DailyPlan />} />
        <Route path="/room/:roomId" element={<VideoRoom />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
