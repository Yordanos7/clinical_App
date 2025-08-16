import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function UpdatePatientData() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedSecretCode = localStorage.getItem("doctorSecretCode");
  const {
    patient,
    doctorId,
    secretCode = storedSecretCode,
  } = location.state || {};
  const finalSecretCode =
    secretCode ||
    location.state?.secretCode ||
    localStorage.getItem("doctorSecretCode");

  if (!finalSecretCode) {
    console.error("No secret code available");
    alert("System error: Missing doctor identification");
    return;
  }

  if (!location.state?.patient) {
    console.error("No patient data found in location.state");
    navigate("/doctor");
    return null;
  }

  console.log("SecretCode in UpdatePatientData:", secretCode);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patient.medicalHistory) {
      try {
        const parsedHistory = JSON.parse(patient.medicalHistory);
        setMedicalHistory(
          Array.isArray(parsedHistory) ? parsedHistory : [parsedHistory]
        );
      } catch (error) {
        setMedicalHistory([patient.medicalHistory]);
      }
    }
  }, [patient.medicalHistory]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setMedicalHistory([...medicalHistory, newItem]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
  };

  console.log("Request Body:", {
    doctorId,
    patientId: patient.id,
    availabilityData: appointmentDate,
  });
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Update medical history
      await axios.put(
        `http://localhost:5000/api/doctor/update-medical-history/${patient.id}`,
        { medicalHistory: JSON.stringify(medicalHistory) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Create appointment if date exists
      if (appointmentDate) {
        await axios.post(
          "http://localhost:5000/api/appointments/setDoctorAvailability",
          {
            doctorId,
            patientId: patient.id,
            availabilityData: appointmentDate,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        window.dispatchEvent(new Event("appointmentCreated"));
      }

      navigate(`/doctor/${finalSecretCode}`, {
        state: {
          success: "Patient data updated successfully!",
          secretCode: secretCode,
        },
      });
    } catch (error) {
      console.error("Update error:", error);
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar mode="vertical" />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Update Patient Data
            </h1>
            <div className="flex items-center mt-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-medium text-lg">
                  {patient.name.charAt(0) + patient.name.charAt(1)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{patient.name}</h2>
                <p className="text-sm text-gray-500">
                  ID: {patient.id} • {patient.email}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Last Updated
              </h3>
              <p className="text-gray-800">May 13, 2025</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Last Appointment
              </h3>
              <p className="text-gray-800">April 28, 2025</p>
            </div>
          </div>

          {/* Update Form */}
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Common Health Data</h3>
              <div className="space-y-4">
                {medicalHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <p className="text-gray-700">{item}</p>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add new health data (e.g., Blood Type: A+)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="ml-4 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Schedule Next Appointment
              </label>
              <div className="flex items-center">
                <input
                  type="datetime-local"
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
                <span className="ml-4 text-sm text-gray-500">
                  {appointmentDate ? "Appointment set" : "No date selected"}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/doctor")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Recent Notes Section */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Notes</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-700">
                  May 10, 2025 - Follow-up required in 2 weeks
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm text-gray-700">
                  April 28, 2025 - Prescribed medication, patient responding
                  well
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
