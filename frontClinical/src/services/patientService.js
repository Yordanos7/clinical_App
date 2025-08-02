import axios from "axios";
const apiEndpoint = "http://localhost:5000/api/patient/";

const getPatientAppointments = async (id) => {
  try {
    const send = await axios.get(`${apiEndpoint}${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
    return send.data;
  } catch (error) {
    console.log("There is an error in appointment service", error);
    throw error;
  }
};
export { getPatientAppointments };
