import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import Lottie from "lottie-react";
import heartbeat from "../animations/heartbeat.json";

export default function AppointmentBooking() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      const patientId = localStorage.getItem("patientId"); // Assuming patientId is stored in localStorage
      try {
        const response = await axios.get(
          `http://localhost:5000/api/appointments/patient/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(response.data.appointments || []);
        setPatientInfo(response.data.patient || null);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError(
          error.response?.data?.message || "Failed to fetch appointments"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <PulseLoader color="#2563EB" size={15} />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Animation */}
        <div className="w-32 h-32 mx-auto mb-6">
          <Lottie animationData={heartbeat} loop={true} />
        </div>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Your Appointments
          </h1>
          <p className="text-gray-600">
            View your upcoming and past appointments, along with details about
            your doctor and medical history.
          </p>
        </div>
        {/* Patient Info */}
        {patientInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Patient Information
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Name:</strong> {patientInfo.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {patientInfo.email}
              </p>
              <p className="text-gray-600">
                <strong>Medical History:</strong>{" "}
                {patientInfo.medicalHistory || "No medical history available"}
              </p>
            </div>
          </div>
        )}
        {/* Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Appointments
          </h2>
          {appointments.length > 0 ? (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">
                        {new Date(appointment.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </h4>
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${
                          appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <strong>Doctor:</strong>{" "}
                        {appointment.doctor?.name || "N/A"} (
                        {appointment.doctor?.specialization || "N/A"})
                      </p>
                    </div>
                  </div>
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
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No appointments found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
