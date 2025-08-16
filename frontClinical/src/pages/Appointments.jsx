import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  getDoctorAppointments,
  getPatientAppointments,
} from "../services/appointmentService";
import { useAuth } from "../context/AuthContext";
import socket from "../services/socketService";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveAppointments, setLiveAppointments] = useState({});
  const navigate = useNavigate();

  const handleJoinRoom = (appointmentId) => {
    if (user.role === "doctor") {
      socket.emit("doctor-live", { roomId: appointmentId });
    }
    navigate(`/room/${appointmentId}`);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response =
          user.role === "doctor"
            ? await getDoctorAppointments()
            : await getPatientAppointments();
        const fetchedAppointments = response.data.appointments || [];
        setAppointments(fetchedAppointments);

        // Join socket rooms for each appointment
        fetchedAppointments.forEach((appointment) => {
          socket.emit("join-room", {
            roomId: appointment.id,
            userId: user.id,
            role: user.role,
          });
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchAppointments();
    }

    socket.on("doctor-is-live", ({ roomId }) => {
      setLiveAppointments((prev) => ({ ...prev, [roomId]: true }));
    });

    const handleAppointmentCreated = () => {
      fetchAppointments();
    };

    window.addEventListener("appointmentCreated", handleAppointmentCreated);

    return () => {
      socket.off("doctor-is-live");
      window.removeEventListener(
        "appointmentCreated",
        handleAppointmentCreated
      );
    };
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar mode="horizontal" user={user} />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            {user.role === "doctor"
              ? "My Appointments"
              : "My Scheduled Appointments"}
          </h1>
          {appointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">
                No appointments found.{" "}
                {user.role === "patient" && "Schedule one with a doctor!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">
                          {user.role === "doctor"
                            ? `Patient: ${
                                appointment.Patient?.name ||
                                appointment.patientName ||
                                "N/A"
                              }`
                            : `Doctor: ${
                                appointment.doctor?.name ||
                                appointment.Doctor?.name ||
                                "N/A"
                              }`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {user.role === "doctor"
                            ? ""
                            : appointment.Doctor?.specialization || ""}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Date: {format(new Date(appointment.date), "PPP")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Time: {format(new Date(appointment.date), "p")}
                      </p>
                      {appointment.medicalHistory && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="text-md font-medium text-gray-700">
                            Medical Notes
                          </h5>
                          <p className="text-gray-600 text-sm mt-2">
                            {appointment.medicalHistory}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleJoinRoom(appointment.id)}
                        className={`${
                          liveAppointments[appointment.id] ||
                          user.role === "doctor"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white font-bold py-2 px-4 rounded`}
                        disabled={
                          user.role === "patient" &&
                          !liveAppointments[appointment.id]
                        }
                      >
                        {user.role === "doctor"
                          ? "Start Live"
                          : liveAppointments[appointment.id]
                          ? "Join Live"
                          : "Waiting for Doctor"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
