import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");

      if (token && role && userId) {
        setUser({ token, role, userId });
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    try {
      const {
        token,
        user: userInfo,
        doctorId,
        patientId,
        secretCode,
      } = userData;
      localStorage.setItem("token", token);
      localStorage.setItem("role", userInfo.role);
      localStorage.setItem("userId", userInfo.id);
      setUser({ token, role: userInfo.role, userId: userInfo.id });

      console.log(
        "Navigating to:",
        userInfo.role,
        doctorId,
        patientId,
        secretCode
      );
      if (userInfo.role === "doctor") {
        navigate(`/doctor/${secretCode}`);
      } else if (userInfo.role === "patient") {
        navigate(`/patient/user/${userInfo.id}`);
      }
    } catch (error) {
      console.error("Failed to process login", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
