import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LogoutIcon from "@mui/icons-material/Logout";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AdbIcon from "@mui/icons-material/Adb";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
      }`}
    >
      {icon && <span className="text-blue-400">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

export default function Navbar({ mode = "vertical", user }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const toggleMobileMenu = () => {
    setShowMobileMenu((prev) => !prev);
  };

  const handleLogOut = () => {
    localStorage.clear(); // Clear all stored data
    navigate("/login");
  };

  // Retrieve role from localStorage
  const role = authUser?.role || localStorage.getItem("role");
  const userId = authUser?.userId || localStorage.getItem("userId");

  console.log("Role from localStorage:", role);

  const navItems = role
    ? role.trim().toLowerCase() === "patient"
      ? [
          { to: "/", label: "Home", icon: <HomeIcon /> },
          {
            to: "/appointments",
            label: "Appointments",
            icon: <ViewTimelineIcon />,
          },
          {
            to: `/medical-record/${userId || ""}`,
            label: "Medical Record",
            icon: <CalendarTodayIcon />,
          },
          {
            to: "/login",
            label: "Logout",
            icon: <LogoutIcon />,
            onClick: handleLogOut,
          },
        ]
      : role.trim().toLowerCase() === "doctor"
      ? [
          { to: "/", label: "Home", icon: <HomeIcon /> },
          {
            to: "/appointments",
            label: "Appointments",
            icon: <ViewTimelineIcon />,
          },
          {
            to: `/daily-plan`,
            label: "Daily plan",
            icon: <MonitorHeartOutlinedIcon />,
          },
          {
            to: "/logout",
            label: "Logout",
            icon: <LogoutIcon />,
            onClick: handleLogOut,
          },
        ]
      : []
    : [
        { to: "/login", label: "Login", icon: <AccountCircleOutlinedIcon /> },
        { to: "/register", label: "Register", icon: <PersonAddIcon /> },
      ];

  return (
    <nav className="flex">
      {/* Background Overlay */}
      {showMobileMenu && mode !== "vertical" && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleMobileMenu}
        ></div>
      )}
      {/* Hamburger Button for Mobile (Horizontal Mode) */}
      {mode !== "vertical" && (
        <button
          className=" md:hidden p-2 text-gray-700 focus:outline-none z-50"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {showMobileMenu ? (
            <CloseIcon fontSize="large" />
          ) : (
            <MenuIcon fontSize="large" />
          )}
        </button>
      )}
      {/* Navbar Container */}
      <div
        className={`${
          mode === "vertical"
            ? " hidden md:flex flex-col w-64 bg-white border-r shadow-md p-4 h-screen gap-4"
            : `fixed w-full bg-white/95 backdrop-blur-md z-40 transition-all duration-300 ${
                showMobileMenu ? "translate-y-0" : "-translate-y-full"
              }  md:flex md:flex-row md:justify-evenly md:items-center md:w-full md:my-2 md:rounded-xl md:shadow-md md:translate-y-0`
        }`}
      >
        {/* Logo/Title */}

        <div>
          <AdbIcon className="text-blue-600 text-4xl animate-bounce" />
        </div>
        <div
          className="flex items-center cursor-pointer p-4 text-blue-600 text-xl font-semibold hover:text-blue-700 transition-colors duration-200"
          onClick={() => navigate("/")}
        >
          <MonitorHeartOutlinedIcon className="mr-2" fontSize="large" />
          <span>Ethiopian Medical System</span>
        </div>
        {/* Navigation Items */}
        <div
          className={`${
            mode === "vertical"
              ? "flex flex-col gap-2"
              : `flex ${
                  showMobileMenu
                    ? "flex-col gap-2 p-4"
                    : "flex-row justify-evenly items-center"
                } md:flex-row md:gap-0 md:p-0`
          }`}
        >
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              to={item.to}
              label={item.label}
              icon={item.icon}
              onClick={item.onClick}
            />
          ))}
        </div>
        {/* User Profile (Vertical Mode Only) */}
        {mode === "vertical" && (
          <div className="mt-auto flex flex-col items-center py-4 border-t border-gray-200">
            {user?.User?.profileImage || user?.profileImage ? (
              <img
                src={`http://localhost:5000${
                  user.User?.profileImage || user.profileImage
                }`}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover mb-2 ring-2 ring-blue-100"
              />
            ) : (
              <AccountCircleOutlinedIcon
                className="text-gray-400"
                fontSize="large"
              />
            )}
            <div className="text-center">
              <h2 className="text-gray-700 font-medium">
                {user?.name || "N/A"}
              </h2>
              <h3 className="text-gray-500 text-sm">
                {user?.User?.email || user?.email || "N/A"}
              </h3>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
