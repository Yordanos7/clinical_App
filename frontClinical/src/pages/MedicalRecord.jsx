import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
export default function MedicalRecord() {
  const { id } = useParams(); // Get patient ID from URL params
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log(id);
  console.log(medicalRecord);

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:5000/api/patient/medical-record/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const recordData = response.data.medicalRecord;
        let parsedRecords = [];
        if (recordData) {
          try {
            parsedRecords = JSON.parse(recordData);
            if (!Array.isArray(parsedRecords)) {
              parsedRecords = [parsedRecords];
            }
          } catch (error) {
            console.error("Failed to parse medical record:", error);
            parsedRecords = [recordData]; // Treat as a single string entry if parsing fails
          }
        }
        setMedicalRecord(parsedRecords);
        setPatientInfo(response.data.patient);
      } catch (error) {
        console.error("Error fetching medical record:", error);
        setError(
          error.response?.data?.message || "Failed to fetch medical record"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecord();
  }, [id]);

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
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Medical Record</h1>
          <p className="text-gray-600">
            View the medical history and details for the selected patient.
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
            </div>
          </div>
        )}
        {/* Medical Record */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Medical History
          </h2>
          {medicalRecord && Array.isArray(medicalRecord) ? (
            medicalRecord.map((record, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-lg bg-gray-50"
              >
                <pre className="text-gray-700 whitespace-pre-wrap font-sans">
                  {typeof record === "string"
                    ? record
                    : JSON.stringify(record, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No medical history available</p>
          )}
        </div>
      </div>
      <div className=" mb-0">
        <button
          onClick={() => navigate(`/patient/${id}`)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded "
        >
          {" "}
          Back to DashBoard
        </button>
      </div>
    </div>
  );
}
