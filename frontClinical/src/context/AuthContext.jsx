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
      const name = localStorage.getItem("name");
      const secretCode = localStorage.getItem("secretCode");

      if (token && role && userId) {
        const userToSet = { token, role, userId, name };
        if (role === "doctor" && secretCode) {
          userToSet.secretCode = secretCode;
        }
        setUser(userToSet);
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
      // Safeguard: Do not overwrite an existing session
      if (user && user.token) {
        console.warn(
          "Login called when a user is already logged in. Aborting."
        );
        return;
      }

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
      localStorage.setItem("name", userInfo.name);

      const userToSet = {
        token,
        role: userInfo.role,
        userId: userInfo.id,
        name: userInfo.name,
      };

      if (userInfo.role === "doctor" && secretCode) {
        localStorage.setItem("secretCode", secretCode);
        userToSet.secretCode = secretCode;
      }

      setUser(userToSet);

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
