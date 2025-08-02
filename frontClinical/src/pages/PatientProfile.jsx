import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { PulseLoader } from "react-spinners";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaQrcode,
  FaHistory,
} from "react-icons/fa";
import { MdEmail, MdError } from "react-icons/md";
import Navbar from "../components/Navbar";
import { getPatientAppointments } from "../services/appointmentService";
//
import socket from "../services/socketService";

export default function PatientProfile() {
  const { userId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !patient || !patient.User) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setIsUploading(true);
      setUploadStatus(null);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axios.post(
        `http://localhost:5000/api/user/${userId}/upload-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus({
        type: "success",
        message: "Profile image uploaded successfully",
      });
      fetchPatientData();
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const fetchPatientData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/patient/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatient(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getPatientAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchPatientData();
    fetchAppointments();
  }, [userId]);

  useEffect(() => {
    if (patient && patient.User) {
      localStorage.setItem("userId", patient.User.id);
    }
  }, [patient]);

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
          <MdError className="mx-auto text-red-500 text-5xl mb-4" />
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

  if (!patient)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Data Found
          </h2>
          <p className="text-gray-600">
            The requested patient profile could not be loaded.
          </p>
        </div>
      </div>
    );
  if (!patient) return <div>Loading...</div>;

  const sendNotification = (doctorId) => {
    socket.emit("sendNotification", {
      doctorId,
      patientId: localStorage.getItem("patientId"),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Vertical Navbar (Desktop) */}

        <div className="hidden md:block w-64 bg-white shadow-lg">
          <Navbar mode="vertical" user={patient} setPatient={setPatient} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Horizontal Navbar (Mobile) */}
          <div className="md:hidden bg-white shadow-sm">
            <Navbar mode="horizontal" />
          </div>

          {/* Mobile Header */}
          <div className="md:hidden p-4 bg-white border-b">
            <h1 className="text-2xl font-bold text-gray-800">
              Patient Dashboard
            </h1>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex border-b mx-4 mb-6">
            {["profile", "appointments", "qrcode"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 md:p-8">
            {/* Desktop Layout */}
            <div className="hidden md:block">
              {/* Profile and QR Code Row */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Profile Card */}
                <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col items-center mb-6">
                    {patient.User?.profileImage ? (
                      <img
                        src={`http://localhost:5000${patient.User.profileImage}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mb-4 ring-2 ring-blue-100"
                      />
                    ) : (
                      <FaUserCircle className="text-8xl text-blue-500 mb-4" />
                    )}
                    <h2 className="text-2xl font-bold text-gray-800">
                      {patient.User?.name || "N/A"}
                    </h2>
                    <div className="flex items-center text-gray-600 mt-2">
                      <MdEmail className="mr-2 text-lg" />
                      <span>{patient.User?.email || "N/A"}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Upload Profile Image
                    </h3>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                      />
                      {isUploading && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                          <PulseLoader color="#2563EB" size={8} />
                        </div>
                      )}
                    </div>
                    {uploadStatus && (
                      <p
                        className={`mt-2 text-sm ${
                          uploadStatus.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {uploadStatus.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-semibold mb-4 flex items-center">
                    <FaQrcode className="mr-2 text-blue-500" />
                    Your QR Code
                  </h3>
                  {patient.qrCode ? (
                    <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg w-full max-w-[300px] transition-transform hover:scale-105">
                      <img
                        src={patient.qrCode}
                        alt="QR Code"
                        className="w-full h-auto max-w-[250px] max-h-[250px] object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No QR Code available
                    </p>
                  )}
                </div>
              </div>

              {/* Appointments Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" />
                  Your Appointments
                </h2>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .filter(
                        (app) =>
                          app.date.split("T")[0] ===
                          new Date().toISOString().split("T")[0]
                      )
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">
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
                                className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                                  appointment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Doctor: {appointment.doctor?.name || "N/A"} (
                            {appointment.doctor?.specialization || "N/A"})
                          </p>
                          {appointment.medicalHistory && (
                            <div className="mt-3 pt-3 border-t">
                              <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                <FaHistory className="mr-1" />
                                Medical Notes
                              </h5>
                              <p className="text-gray-600 text-sm mt-1">
                                {appointment.medicalHistory}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No appointments found for today
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              {activeTab === "profile" && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col items-center mb-6">
                    {patient.User?.profileImage ? (
                      <img
                        src={`http://localhost:5000${patient.User.profileImage}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-blue-100"
                      />
                    ) : (
                      <FaUserCircle className="text-6xl text-blue-500 mb-4" />
                    )}
                    <h2 className="text-xl font-bold text-gray-800">
                      {patient.User?.name || "N/A"}
                    </h2>
                    <div className="flex items-center text-gray-600 mt-2">
                      <MdEmail className="mr-2" />
                      <span>{patient.User?.email || "N/A"}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">
                      Upload Profile Image
                    </h3>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                      />
                      {isUploading && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                          <PulseLoader color="#2563EB" size={8} />
                        </div>
                      )}
                    </div>
                    {uploadStatus && (
                      <p
                        className={`mt-2 text-sm ${
                          uploadStatus.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {uploadStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "qrcode" && (
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center mb-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FaQrcode className="mr-2 text-blue-500" />
                    Your QR Code
                  </h3>

                  {patient.qrCode ? (
                    <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg w-full max-w-[80vw] sm:max-w-[400px] transition-transform hover:scale-105">
                      <img
                        src={patient.qrCode}
                        alt="QR Code"
                        className="w-full h-auto max-w-[250px] max-h-[250px] object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No QR Code available
                    </p>
                  )}
                </div>
              )}

              {activeTab === "appointments" && (
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Your Appointments
                  </h2>

                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments
                        .filter(
                          (app) =>
                            app.date.split("T")[0] ===
                            new Date().toISOString().split("T")[0]
                        )
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <h4 className="font-medium text-gray-800">
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
                            <p className="text-gray-600 mt-1">
                              Status: {appointment.status}
                            </p>
                            <p className="text-gray-600">
                              Doctor: {appointment.doctor?.name || "N/A"} (
                              {appointment.doctor?.specialization || "N/A"})
                            </p>
                            {appointment.medicalHistory && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                  <FaHistory className="mr-1" />
                                  Medical Notes
                                </h5>
                                <p className="text-gray-600 text-sm mt-1">
                                  {appointment.medicalHistory}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No appointments found for today
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
