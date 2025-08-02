import { useEffect, useState } from "react";
import QRScanner from "../components/QRScanner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PulseLoader } from "react-spinners";
import { FaUserCircle } from "react-icons/fa";

//
import socket from "../services/socketService";

// const secretCodeId = getlocalStorage.getItem("secretCodeId");

export default function DoctorDashboard() {
  const { secretCode } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startScan, setStartScan] = useState(false);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
    recoveryRate: 0,
  });
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const fetchAppointments = async () => {
    if (!doctor) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/appointments/doctor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const appointments = response.data.appointments || [];
      setAppointments(appointments);

      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointments.filter(
        (app) => app.date.split("T")[0] === today
      ).length;
      const totalPatients = [
        ...new Set(appointments.map((app) => app.patientId)),
      ].length;
      const pendingReports = appointments.filter(
        (app) => app.status === "pending"
      ).length;
      const completedAppointments = appointments.filter(
        (app) => app.status === "completed"
      ).length;
      const recoveryRate =
        appointments.length > 0
          ? Math.round((completedAppointments / appointments.length) * 100)
          : 0;

      setStats({
        todayAppointments,
        totalPatients,
        pendingReports,
        recoveryRate,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !doctor || !doctor.User) return;

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
      fetchDoctorData();
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

  // Fetch doctor data and appointments
  const fetchDoctorData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing. Redirecting to login...");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/doctor/secretcode/${secretCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDoctor(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Token expired. Redirecting to login...");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Error fetching doctor data:", error);
      }
    }
  };

  useEffect(() => {
    if (secretCode) {
      localStorage.setItem("doctorSecretCode", secretCode);
    }

    socket.on("receiveNotification", (data) => {
      alert(`Patient ${data.patientId} is requesting a live consultation.`);
    });

    fetchDoctorData();
  }, [secretCode]);

  useEffect(() => {
    if (doctor && doctor.User) {
      localStorage.setItem("userId", doctor.User.id);
    }
    console.log("Doctor object:", doctor);
    fetchAppointments();
  }, [doctor]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <PulseLoader color="#3B82F6" size={15} />
      </div>
    );

  // Handle managing patient data
  const handleManagePatient = async (appointmentId, action, data = {}) => {
    try {
      if (action === "delete") {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Refetch appointments after deletion
        fetchAppointments();
      } else {
        const response = await axios.post(
          `http://localhost:5000/api/doctor/manage-patient/${appointmentId}`,
          { action, data },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error managing patient data:", error);
      alert("Failed to manage patient data");
    }
  };

  // Handle QR code scanning success
  const handleScanSuccess = async (decodedText) => {
    try {
      const patientId =
        decodedText.split("/patient/")[1]?.split("/")[0] || decodedText;
      const response = await axios.post(
        "http://localhost:5000/api/doctor/scan-qrcode",
        { qrData: patientId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setPatient(response.data.patient);
        navigate("/updatePatientData", {
          state: {
            patient: response.data.patient,
            doctorId: doctor?.id,
            secretCode: secretCode,
          },
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Scan failed");
    } finally {
      setStartScan(false); // Ensure scanning is stopped
    }
  };

  const startScanning = () => {
    setStartScan(!startScan);
  };

  if (error) return <div className="p-8">Error loading data</div>;
  if (!doctor) return <div>Loading...</div>;

  const acceptNotification = (patientId) => {
    const roomId = Math.random().toString(36).substring(2, 15); // Generate random room ID
    socket.emit("acceptNotification", {
      doctorId: localStorage.getItem("doctorId"),
      patientId,
      roomId,
    });
    navigate(`/video-room/${roomId}`);
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Vertical Navbar (hidden on mobile) */}
      <div className="hidden md:block">
        <Navbar mode="vertical" user={doctor} />
      </div>

      {/* Horizontal Navbar (visible on mobile) */}
      <div className="md:hidden">
        <Navbar mode="horizontal" />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            {doctor?.User?.profileImage ? (
              <img
                src={`http://localhost:5000${doctor.User.profileImage}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-2 ring-blue-100"
              />
            ) : (
              <FaUserCircle className="text-6xl text-blue-500" />
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Welcome back, Dr. {doctor?.name}. Here's what's happening today.
              </h1>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {isUploading && (
                  <div className="mt-2">
                    <PulseLoader color="#2563EB" size={8} />
                  </div>
                )}
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Today's Appointments
            </h3>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {stats.todayAppointments}
            </p>
            <p className="text-green-500 text-xs md:text-sm mt-1">
              {stats.todayAppointments > 0
                ? "Ready for you"
                : "No appointments today"}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Total Patients
            </h3>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {stats.totalPatients}
            </p>
            <p className="text-green-500 text-xs md:text-sm mt-1">
              {stats.totalPatients > 0 ? "Under your care" : "No patients yet"}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Pending Reports
            </h3>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {stats.pendingReports}
            </p>
            <p
              className={`${
                stats.pendingReports > 0 ? "text-red-500" : "text-green-500"
              } text-xs md:text-sm mt-1`}
            >
              {stats.pendingReports > 0 ? "Needs attention" : "All clear"}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Completion Rate
            </h3>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {stats.recoveryRate}%
            </p>
            <p className="text-green-500 text-xs md:text-sm mt-1">
              {stats.recoveryRate > 75 ? "Excellent" : "Needs improvement"}
            </p>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold">
              Today's Appointments
            </h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-b pb-3 md:pb-4 last:border-b-0"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="font-medium">
                        Patient ID: {appointment.patientId}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        Appointment Date:{" "}
                        {new Date(appointment.date).toLocaleString()}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        Status: {appointment.status}
                      </p>
                    </div>
                    <div className="flex sm:flex-col md:flex-row justify-end gap-2">
                      <button
                        className="text-blue-600 text-xs md:text-sm font-medium"
                        onClick={() =>
                          handleManagePatient(appointment.patientId, "update", {
                            name: "Updated Name",
                          })
                        }
                      >
                        Update
                      </button>
                      <button
                        className="text-red-600 text-xs md:text-sm font-medium"
                        onClick={() =>
                          handleManagePatient(appointment.id, "delete")
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                No appointments scheduled for today
              </div>
            )}
          </div>
        </div>

        {/* Patient Information Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-center py-8 md:py-12">
            {startScan ? (
              <QRScanner onScanSuccess={handleScanSuccess} />
            ) : (
              <>
                <h3 className="text-md md:text-lg font-medium mb-3 md:mb-4">
                  Patient Information
                </h3>
                <p className="text-gray-500 mb-4 md:mb-6">
                  Scan QR code to view patient data
                </p>
                <button
                  onClick={startScanning}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 md:px-6 rounded-lg text-sm md:text-base"
                >
                  Scan Patient QR
                </button>
              </>
            )}
            {!startScan && patient && (
              <div className="mt-6 md:mt-8">
                <p className="text-gray-500">Patient: {patient.User?.name}</p>
              </div>
            )}
            {!startScan && !patient && (
              <div className="mt-6 md:mt-8">
                <p className="text-gray-500">No Patient Selected</p>
                <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">
                  Scan a patient's QR code or select a patient from the
                  appointments list to view their information
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Footer */}
        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-500">
          <p>Dr. {doctor?.name}</p>
          <p>{doctor?.specialization || "General Practitioner"}</p>
        </div>
      </main>
    </div>
  );
}
