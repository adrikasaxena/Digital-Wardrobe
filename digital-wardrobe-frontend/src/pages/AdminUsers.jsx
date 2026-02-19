import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!storedUser || storedUser.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3001/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data);
    } catch (err) {
      navigate("/login");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    await axios.delete(
      `http://localhost:3001/api/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-latte px-12 py-16">
      <h1 className="text-4xl font-serif text-cocoa mb-10">
        Manage Users
      </h1>

      <div className="space-y-4 max-w-4xl">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-beige p-6 rounded-xl flex justify-between items-center shadow-sm"
          >
            <div>
              <p className="text-cocoa font-medium">
                {user.name}
              </p>
              <p className="text-sm text-cocoa/70">
                {user.email}
              </p>
              <p className="text-xs text-cocoa/60 mt-1">
                Role: {user.role}
              </p>
            </div>

            {user.role !== "admin" && (
              <button
                onClick={() => deleteUser(user._id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
