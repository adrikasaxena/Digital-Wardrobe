import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/profile");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // 1️ create account
      await axios.post("http://localhost:3001/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // 2️ auto-login after signup
      const loginRes = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      // 3️ store auth
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));
      window.dispatchEvent(new Event("auth-changed"));

      setSuccess("Account created successfully. Redirecting…");

      // 4 go to profile
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      setError("Signup failed. Email may already be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-latte flex items-center justify-center px-4">
      <div className="bg-beige w-full max-w-md p-10 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-serif text-cocoa mb-2">
          Create an account
        </h1>
        <p className="text-cocoa mb-8">
          Build and manage your personalized digital wardrobe.
        </p>

        <form onSubmit={submitForm} className="space-y-5">
          <div>
            <label className="block text-sm text-cocoa mb-1">
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-cocoa mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-cocoa mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
              placeholder="Create a password"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {success && (
            <p className="text-green-600 text-sm">{success}</p>
          )}

          <button
            type="submit"
            className="w-full bg-mocha text-latte py-3 rounded-md text-sm tracking-wide hover:opacity-90 transition"
          >
            Create Account
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-sm text-cocoa text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-mocha font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
