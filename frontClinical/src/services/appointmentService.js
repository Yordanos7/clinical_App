import axios from "axios";

const API_URL = "http://localhost:5000/api/appointments";

export const getDoctorAppointments = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/doctor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPatientAppointments = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/patient`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const setDoctorAvailability = async (
  doctorId,
  patientId,
  availabilityData
) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API_URL}/setDoctorAvailability`,
    {
      doctorId,
      patientId,
      availabilityData,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
