import axiosInstance from "./axiosInstance";

export const handleSignUp = async (
  username: string,
  email: string,
  password: string,
  password2: string,
  rememberMe: boolean
) => {
  try {
    const response = await axiosInstance.post("api/signup/", {
      username,
      email,
      password,
      password2,
    });

    const data = response.data;
    sessionStorage.setItem("token", data.token);

    if (rememberMe) {
      localStorage.setItem("token", data.token);
    }

    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("email", data.email);

    return true;
  } catch (error: any) {
    console.error("Signup error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Failed to sign up");
  }
};

export const handleSignIn = async (
  username: string,
  password: string,
  rememberMe: boolean
) => {
  try {
    const response = await axiosInstance.post("api/login/", {
      username,
      password,
    });

    const data = response.data;
    sessionStorage.setItem("token", data.token);
    console.log("Token:", data.token);

    if (rememberMe) {
      localStorage.setItem("token", data.token);
    }

    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("email", data.email);

    return true;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Failed to sign in");
  }
};
