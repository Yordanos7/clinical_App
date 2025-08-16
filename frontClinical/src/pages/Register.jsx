import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RegisterUser } from "../services/authService";
import Lottie from "lottie-react";
import register from "../animations/register.json";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [registerData, setRegisterData] = useState({
    role: "patient",
    name: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    secretCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await RegisterUser({
        ...registerData,
        name: `${registerData.name} ${registerData.lastName}`,
      });
      login(response.data);
    } catch (error) {
      console.error(
        "Error during registration:",
        error.response?.data || error.message
      );
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50  w-full">
      {/* Navigation */}
      <div className="w-full p-4">
        <h2
          className="font-bold text-blue-600 text-2xl cursor-pointer"
          onClick={() => navigate("/")}
        >
          Ethiopian Clinical System
        </h2>
      </div>

      {/* Main content */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center gap-10 p-6 flex-1 flex-wrap">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="w-full p-8 bg-white shadow-lg rounded-2xl  flex flex-col gap-6  md:w-[400px]"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Create an account</h2>
            <p className="text-gray-600">
              Enter your information to create an account
            </p>
          </div>

          {/* Role selection */}
          <div className="flex flex-col gap-2">
            <h2 className="text-gray-700">Account Type</h2>
            <div className="flex gap-5">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={registerData.role === "patient"}
                  onChange={handleChange}
                />
                Patient
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={registerData.role === "doctor"}
                  onChange={handleChange}
                />
                Doctor
              </label>
            </div>
          </div>

          {/* Name fields */}
          <div className="flex flex-col md:flex-row gap-4 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label>First Name</label>
                <input
                  name="name"
                  value={registerData.name}
                  onChange={handleChange}
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex flex-col ">
                <label>Last Name</label>
                <input
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleChange}
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label>Email</label>
            <input
              name="email"
              value={registerData.email}
              onChange={handleChange}
              type="email"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label>Password</label>
            <input
              name="password"
              value={registerData.password}
              onChange={handleChange}
              type="password"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {registerData.role === "doctor" && (
            <div className="flex flex-col">
              <label>Secret Code</label>
              <input
                name="secretCode"
                value={registerData.secretCode}
                onChange={handleChange}
                type="password"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <div>
                <label htmlFor="">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={registerData.specialization || ""}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Cardiology, Neurology"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-300"
          >
            Create Account
          </button>

          {/* Already have account */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </div>
        </form>

        {/* Image Section */}
        <div className="hidden md:block w-[500px]">
          <Lottie animationData={register} loop={true} />
        </div>
      </div>
    </div>
  );
}
