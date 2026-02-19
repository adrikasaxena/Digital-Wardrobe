import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // fetch orders for this user
    axios
      .get(`http://localhost:3001/api/orders/user/${parsedUser._id}`)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [navigate]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/logout");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-latte px-12 py-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-serif text-cocoa mb-8">
          My Account
        </h1>

        {/* ================= USER INFO ================= */}
        <div className="bg-beige p-6 rounded-2xl mb-12 shadow-sm">
          <h2 className="text-xl text-cocoa mb-4">
            Account Details
          </h2>

          <p className="text-cocoa mb-2">
            <span className="font-medium">Name:</span> {user.name}
          </p>

          <p className="text-cocoa mb-2">
            <span className="font-medium">Email:</span> {user.email}
          </p>

          <p className="text-cocoa mb-6">
            <span className="font-medium">Role:</span>{" "}
            {user.role === "admin" ? "Administrator" : "User"}
          </p>

          <button
            onClick={handleLogout}
            className="bg-mocha text-latte px-6 py-3 rounded-md text-sm hover:opacity-90 transition"
          >
            Log out
          </button>
        </div>

        {/* ================= ORDER HISTORY ================= */}
        <div className="bg-beige p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl text-cocoa mb-4">
            Order History
          </h2>

          {orders.length === 0 ? (
            <p className="text-cocoa">
              You have not placed any orders yet.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border-b border-cocoa/20 pb-4"
                >
                  <p className="text-sm text-cocoa/75 break-all">
                    Order ID: {order._id}
                  </p>
                  <p className="text-cocoa font-medium">
                    Total: ${order.totalAmount}
                  </p>

                  <p className="text-sm text-cocoa/70">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-cocoa/70">
                    Items: {order.items.length}
                  </p>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {order.items.map((item, index) => (
                        <p
                          key={`${order._id}-${item.productId || item.name}-${index}`}
                          className="text-sm text-cocoa/85"
                        >
                          {item.name} x {item.quantity} - $
                          {Number(item.price || 0) * Number(item.quantity || 1)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
