import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = storedUser?.role === "admin";

  useEffect(() => {
    // clear session
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    window.dispatchEvent(new Event("auth-changed"));

    // longer delay (4.5 seconds)
    const timer = setTimeout(() => {
      navigate("/login");
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-latte flex items-center justify-center px-4">
      <div className="bg-beige p-12 rounded-2xl text-center shadow-sm max-w-md">
        <h1 className="text-3xl font-serif text-cocoa mb-4">
          {isAdmin ? "Admin logged out" : "You’ve been logged out"}
        </h1>

        <p className="text-cocoa leading-relaxed">
          {isAdmin
            ? "Your administrator session has ended successfully. You will be redirected shortly."
            : "Your session has ended successfully. Thank you for visiting Digital Wardrobe."}
        </p>

        <p className="text-sm text-cocoa/60 mt-6">
          Redirecting to sign in…
        </p>
      </div>
    </div>
  );
}
