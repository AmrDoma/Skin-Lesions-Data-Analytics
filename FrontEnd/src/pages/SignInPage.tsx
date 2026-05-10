"use client";
import { useEffect, useState } from "react";
import { handleSignIn } from "../services/userAuthentication";
import { toast } from "react-hot-toast";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({
    username: "",
    password: "",
  });
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  useEffect(() => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      window.location.href = "/"; // Redirect to dashboard
    }
  }, []);
  const handleForgotPasswordClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setShowForgotPasswordPopup(true);
  };

  const closePopup = () => {
    setShowForgotPasswordPopup(false);
  };

  const validateField = (name: string, value: string) => {
    setError((prev) => {
      const newErrors = { ...prev };
      if (name === "username") {
        newErrors.username =
          value.length >= 3 ? "" : "Username must be at least 3 characters.";
      }
      if (name === "password") {
        newErrors.password =
          value.length >= 8 ? "" : "Password must be 8 characters or more.";
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    validateField("username", username);
    validateField("password", password);
    return !error.username && !error.password;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({ username: "", password: "" }); // Reset errors
    if (!validateForm()) {
      alert("Please fill in all fields correctly.");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await handleSignIn(username, password, rememberMe);
      if (success) {
        toast.success("Login successful!");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (err: any) {
      console.error("Login failed:", err.message);
      toast.error("Login failed: " + err.message);
      setError(err.message || "An error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
      validateField(name, value);
    }
    if (name === "password") {
      setPassword(value);
      validateField(name, value);
    }
  };

  return (
    <div className=" flex items-center justify-center min-h-screen bg-background ">
      <div className="flex flex-row items-center justify-center mb-4 space-x-60">
        <div className="flex flex-col items-center justify-center mb-4">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-90 h-90 rounded-2xl mx-auto mb-4"
          />
        </div>

        <div className="bg-foreground p-8 rounded-lg shadow-2xl shadow-secondary w-96">
          <div className="flex items-center justify-center w-30 h-15  text-background rounded-full mx-auto">
            <h2 className="text-3xl font-bold text-center text-secondary">
              Sign In
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-text text-sm font-semibold mb-2"
              >
                {" "}
                username{" "}
              </label>
              <input
                data-testid="username-input"
                id="username"
                type="username"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={handleChange}
                required
                className="w-full p-3 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-text"
              />
              {error.username && (
                <p className="text-red-500 mt-1">{error.username}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-text text-sm font-semibold mb-2"
              >
                {" "}
                Password{" "}
              </label>
              <input
                data-testid="password-input"
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
                required
                className="w-full p-3 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-background text-text"
              />
              {error.password && (
                <p className="text-red-500 mt-1">{error.password}</p>
              )}
            </div>
            <div>
              <input
                data-testid="remember-me-checkbox"
                id="rememberMe"
                type="checkbox"
                value="true"
                onChange={(e) => setRememberMe(e.target.checked)}
                className=" w-3 h-3 accent-secondary"
              />
              <label htmlFor="rememberMe" className="ml-2 text-text text-sm">
                Remember Me
              </label>
              <a
                href="#"
                onClick={handleForgotPasswordClick}
                className="ml-20 text-left text-secondary hover:underline text-sm"
              >
                Forgot password?
              </a>
            </div>
            <button
              data-testid="submit-button"
              type="submit"
              className="w-full hover:opacity-70 font-semibold p-3 rounded-lg transition duration-300"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-background)",
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-text mt-4">
            First Time Using The App?{" "}
            <a href="/signup" className="text-secondary hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
      {showForgotPasswordPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-background p-6 rounded-xl shadow-2xl">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-text font-bold text-lg"
            >
              ✕
            </button>
            <img
              src="/image.png"
              alt="Forgot Password Info"
              className="max-w-sm max-h-[70vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
