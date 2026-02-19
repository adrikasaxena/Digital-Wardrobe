import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");

  // if already logged in → redirect by role
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      user.role === "admin" ? navigate("/admin") : navigate("/profile");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      const loggedUser = res.data.user;

      // role mismatch protection
      if (loggedUser.role !== form.role) {
        setError(
          `This account is not registered as a ${form.role}.`
        );
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      window.dispatchEvent(new Event("auth-changed"));

      loggedUser.role === "admin"
        ? navigate("/admin")
        : navigate("/profile");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-latte flex items-center justify-center px-4">
      <div className="bg-beige w-full max-w-md p-10 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-serif text-cocoa mb-2">
          Sign in
        </h1>
        <p className="text-cocoa mb-8">
          Access your digital wardrobe.
        </p>

        {/* role selector */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "user" })}
            className={`flex-1 py-2 rounded-md text-sm transition ${
              form.role === "user"
                ? "bg-mocha text-latte"
                : "border border-mocha text-mocha"
            }`}
          >
            User Login
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, role: "admin" })}
            className={`flex-1 py-2 rounded-md text-sm transition ${
              form.role === "admin"
                ? "bg-mocha text-latte"
                : "border border-mocha text-mocha"
            }`}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={submitForm} className="space-y-5">
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
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-mocha text-latte py-3 rounded-md text-sm tracking-wide hover:opacity-90 transition"
          >
            Sign In
          </button>
        </form>

        {/* signup only for users */}
        {form.role === "user" && (
          <p className="text-sm text-cocoa mt-6 text-center">
            New here?{" "}
            <Link
              to="/signup"
              className="text-mocha font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
