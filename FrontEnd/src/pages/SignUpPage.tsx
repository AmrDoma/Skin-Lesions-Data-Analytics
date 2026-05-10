"use client";
import { useEffect, useState } from "react";
import { handleSignUp } from "../services/userAuthentication";
import { toast } from "react-hot-toast";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  useEffect(() => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      window.location.href = "/"; // Redirect to dashboard
    }
  }, []);

  const validateField = (name: string, value: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    setError((prev) => {
      const newErrors = { ...prev };
      if (name === "username") {
        newErrors.username =
          value.length >= 3 ? "" : "Username must be at least 3 characters.";
      }
      if (name === "email") {
        newErrors.email = emailRegex.test(value)
          ? ""
          : "Please enter a valid email address.";
      }
      if (name === "password") {
        const passwordErrors: string[] = [];
        if (value.length < 8) {
          passwordErrors.push("Password must be at least 8 characters.");
        }
        if (value === value.toLowerCase() || value === value.toUpperCase()) {
          passwordErrors.push(
            "Password must include both uppercase and lowercase letters."
          );
        }
        if (/^\d+$/.test(value)) {
          passwordErrors.push("This password is entirely numeric.");
        }
        if (value === "12345678" || value === "password") {
          passwordErrors.push("This password is too common.");
        }
        newErrors.password = passwordErrors.join(" ");
      }
      if (name === "confirmPassword") {
        newErrors.confirmPassword =
          value === password ? "" : "Passwords do not match.";
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    validateField("username", username);
    validateField("email", email);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);
    return !error.email && !error.password && !error.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({ email: "", password: "", confirmPassword: "", username: "" }); // Reset errors

    if (!validateForm()) {
      alert("Please fill in all fields correctly.");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await handleSignUp(
        username,
        email,
        password,
        confirmPassword,
        rememberMe
      );
      if (success) {
        toast.success("Sign up successful!");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (err: any) {
      console.error("Sign up failed:", err.message);
      toast.error("Sign up failed");
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
    } else if (name === "email") {
      setEmail(value);
      validateField(name, value);
    } else if (name === "password") {
      setPassword(value);
      validateField(name, value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      validateField(name, value);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-row items-center justify-center mb-4 space-x-60">
        <div className="flex flex-col items-center justify-center mb-4">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-90 h-90 rounded-2xl mx-auto mb-4"
          />
        </div>
        <div className="bg-foreground p-8 rounded-lg shadow-2xl shadow-secondary w-96">
          <h2 className="text-3xl font-bold text-center text-secondary mb-6">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-text mb-1"
              >
                Username
              </label>
              <input
                name="username"
                type="text"
                value={username}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-background text-text border focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your username"
              />
              {error.username && (
                <p className="text-red-500 text-sm mt-1">{error.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-text mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-background text-text border focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your email"
              />
              {error.email && (
                <p className="text-red-500 text-sm mt-1">{error.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-text mb-1"
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-background text-text border focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your password"
              />
              {error.password && (
                <p className="text-red-500 text-sm mt-1">{error.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-text mb-1"
              >
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-background text-text border focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Confirm your password"
              />
              {error.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {error.confirmPassword}
                </p>
              )}
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-text">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold p-3 rounded-lg transition duration-300 hover:opacity-80"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-background)",
              }}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-text mt-4">
            Already have an account?{" "}
            <a href="/signin" className="text-secondary hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
