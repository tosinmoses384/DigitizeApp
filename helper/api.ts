/**Make API Request */

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

export const getUserName = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) return Promise.reject("Cannot find Token");
  let decode = jwtDecode(token);
  ("DECODETOKEN", decode);
  return decode;
};

/** authenticate function */
export const authenticate = async (username: any) => {
  try {
    return await axios.post("/api/authenticate", { username });
  } catch (error) {
    return { status: 404, error: "Username doesn't exist...!" };
  }
};

/** get User details */
export const getUser = async (username: any) => {
  try {
    const { data } = await axios.get(`/api/user/${username}`);
    return { data };
  } catch (error) {
    return { error: "Password doesn't Match...!" };
  }
};

/** register user function */
export async function registerUser(credentials: any) {
  try {
    const {
      data: { msg },
      status,
    } = await axios.post("/api/register", credentials);

    ("REGISTER", msg);

    let { username, email } = credentials;

    /** send email */
    if (status === 201) {
      await axios.post("/api/registerMail", {
        username,
        userEmail: email,
        text: msg,
      });
    }

    return status;
  } catch (error) {
    throw { error };
  }
}

/** login function */
export async function verifyPassword(username: any, password: any) {
  try {
    if (username) {
      const { data } = await axios.post("/api/login", { username, password });
      return { data };
    }
  } catch (error) {
    throw { error: "Password doesn't Match...!" };
  }
}

/** update user profile function */
export async function updateUser(response: any) {
  try {
    const token = await localStorage.getItem("token");
    const { data } = await axios.put("/api/updateuser", response, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { data };
  } catch (error) {
    throw { error: "Couldn't Update Profile...!" };
  }
}

export async function generateOTP(username: any) {
  try {
    const {
      data: { code },
      status,
    } = await axios.get("/api/generateOTP", { params: { username } });
    ("APIOTP", code);

    // send mail with the OTP
    if (status === 201) {
      const {
        data: { email },
      } = await getUser(username);
      const text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
      ("emailotp", email);
      await axios.post("/api/registerMail", {
        username,
        userEmail: email,
        text,
        subject: "Password Recovery OTP",
      });
      ("DONE", code);
    }

    return code;
  } catch (error) {
    throw { error };
  }
}

/** verify OTP */
export async function verifyOTP(username: any, code: any) {
  try {
    const { data, status } = await axios.get("/api/verifyOTP", {
      params: { username, code },
    });
    ("APISTATUS", status);
    return { data, status };
  } catch (error) {
    return error;
  }
}

/** reset password */
export async function resetPassword(username: any, password: any) {
  try {
    const { data, status } = await axios.put("/api/resetPassword", {
      username,
      password,
    });
    return { data, status };
  } catch (error) {
    throw { error };
  }
}