import axios from "axios";

const RegisterUser = async (data) => {
  console.log("register data", data);
  const send = await axios.post(
    "http://localhost:5000/api/user/register",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log(send.data);
  return send;
  // why we need to return the promise or send from backend to frontend.
  // If we don't return the promise, the function will return undefined instead.
};
const loginUser = async (data) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/user/login",
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { token, user, doctorId, patientId, secretCode } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("userId", user.id);
    if (user.role === "doctor") {
      localStorage.setItem("doctorId", doctorId);
      localStorage.setItem("secretCode", secretCode);
    } else if (user.role === "patient") {
      localStorage.setItem("patientId", patientId);
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const getDoctorBySecretCode = async (secretCode) => {
  const send = await axios.get(
    `http://localhost:5000/api/doctor/secret/${secretCode}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return send;
};

// yo i have to put register part by google is here.
export { RegisterUser, loginUser, getDoctorBySecretCode };
