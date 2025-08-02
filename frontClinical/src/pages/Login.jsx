import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

export default function Login() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(loginData);
      login(response);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend Google OAuth endpoint
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="w-full h-screen flex flex-col gap-3.5">
      <div className="w-full h-7 m-5">
        <h2>Ethiopian Clinical System</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full h-auto flex flex-col justify-center items-center gap-3.5 p-9 rounded-lg"
      >
        <div className="flex flex-col gap-4 border-2 p-6 rounded-2xl shadow-md bg-white border-gray-300">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">Login</h1>
            <h2 className="text-sm text-gray-500">
              Enter your email and password to Login
            </h2>
          </div>
          <div>
            <label htmlFor="emailInput">Email</label>
            <input
              type="email"
              id="emailInput"
              name="email"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <button
              type="submit"
              className="w-full bg-blue-500 p-2 text-white rounded-md hover:bg-blue-600 transition"
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-red-500 p-2 text-white rounded-md hover:bg-red-600 transition mt-3"
            >
              Login with Google
            </button>
            <h2 className="flex justify-center gap-1.5 text-sm mt-1">
              Don't have an account?
              <Link to="/register" className="text-blue-500">
                Register
              </Link>
            </h2>
          </div>
        </div>
      </form>
    </div>
  );
}
