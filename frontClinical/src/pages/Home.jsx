import React, { useState, useEffect } from "react";
import doctorImage from "../assets/doctor.jpg";
//import patient from "../assets/patient.jpg";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ShieldIcon from "@mui/icons-material/Shield";
import Login from "./Login";
import Register from "./Register";
import AdbIcon from "@mui/icons-material/Adb";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import qrcode from "../animations/qrcode.json";
import role from "../animations/role.json";
import security from "../animations/security.json";
import axios from "axios";
import MsNurseChat from "./MsNurseChat";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");

      if (token && userId && role) {
        try {
          const endpoint =
            role === "doctor"
              ? `http://localhost:5000/api/doctor/${userId}`
              : `http://localhost:5000/api/patient/${userId}`;

          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const toLoginpage = () => {
    navigate("/register");
  };
  const toAboutPage = () => {
    navigate("/about");
  };
  return (
    <div className="h-auto w-full bg-white">
      <Navbar mode="horizontal" user={user} />
      {/* <div className="p-9 w-full h-auto">
    
      </div> */}
      {/* <div className="min-h-screen bg-gray-100 p-6">
        <MsNurseChat />
      </div> */}
      {/* Hero Section */}
      <section className="relative flex flex-col sm:flex-row w-full">
        {/* Text Overlay */}
        <div className="absolute inset-0  bg-opacity-50 flex flex-col justify-center items-start p-8 text-white z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className=" "
          >
            <h1 className="text-4xl font-bold mb-4">
              Modern Healthcare Management for Ethiopian Hospitals
            </h1>
            <p className="text-lg mb-6">
              Our digital platform eliminates physical patient cards with QR
              codes and enables doctors to efficiently manage appointments and
              medical records.
            </p>
          </motion.div>
          <div className="flex gap-4">
            <button
              className="bg-white text-blue-600 font-semibold px-6 py-2 rounded hover:bg-blue-600 hover:text-white transition"
              onClick={toLoginpage}
            >
              Get Started
            </button>
            <button className="bg-transparent border-2 border-white px-6 py-2 rounded hover:bg-white hover:text-blue-600 transition">
              <button onClick={toAboutPage}>Read More</button>
            </button>
          </div>
        </div>

        {/* Background Image */}
        <div className="w-full h-[500px] mt-12 sm:mt-12 md:mt-16 lg:mt-24">
          <img
            src="./public/clinical.jpeg"
            alt="Doctor"
            className="w-[100%] h-full object-cover flex-shrink-0"
          />
        </div>
      </section>

      {/* Key Features Section */}
      <section className="flex flex-col items-center w-full py-16 px-4 bg-gray-100">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Key Features</h1>
          <p className="text-xl text-gray-600">
            Our platform provides a comprehensive solution for healthcare
            management
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          <div className="  rounded-lg p-8 flex flex-col items-center hover:scale-105 transition">
            <Lottie animationData={role} loop={true} />
            <h2 className="text-2xl font-semibold mb-2">Role-Based Access</h2>
            <p className="text-center text-gray-600">
              Secure access for doctors and patients with appropriate
              permissions for each role.
            </p>
          </div>
          <div className="  rounded-lg p-8 flex flex-col items-center hover:scale-105 transition">
            <Lottie animationData={qrcode} loop={true} />
            <h2 className="text-2xl font-semibold mb-2">QR Code System</h2>
            <p className="text-center text-gray-600">
              Digital patient identification with QR codes for instant access to
              medical records.
            </p>
          </div>
          <div className="  rounded-lg p-8 flex flex-col items-center hover:scale-105 transition">
            <Lottie animationData={security} loop={true} />
            <h2 className="text-2xl font-semibold mb-2">Secure Records</h2>
            <p className="text-center text-gray-600">
              Encrypted medical records with strict access controls to protect
              patient privacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
