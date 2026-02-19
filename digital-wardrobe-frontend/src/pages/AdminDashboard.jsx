import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const PRODUCTS_API = "http://localhost:3001/api/products";
  const USERS_API = "http://localhost:3001/api/users";
  const ORDERS_API = "http://localhost:3001/api/orders";

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  /* =======================
     PROTECT ADMIN PAGE
  ======================= */
  useEffect(() => {
    if (!storedUser || storedUser.role !== "admin") {
      navigate("/login");
    }
  }, [navigate, storedUser]);

  /* =======================
     TABS
  ======================= */
  const [tab, setTab] = useState("products");

  /* =======================
     PRODUCTS STATE
  ======================= */
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    "Tops",
    "Bottoms",
    "Shoes",
    "Accessories",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    sizes: [],
    inStock: true,
  });

  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  /* =======================
     USERS STATE
  ======================= */
  const [users, setUsers] = useState([]);
  const [userEditId, setUserEditId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [orders, setOrders] = useState([]);

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* =======================
     FETCH DATA
  ======================= */
  const fetchProducts = async () => {
    const res = await axios.get(PRODUCTS_API);
    setProducts(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(USERS_API, authHeaders);
    setUsers(res.data);
  };

  useEffect(() => {
    axios
      .get(PRODUCTS_API)
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]));

    axios
      .get(USERS_API, authHeaders)
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]));

    axios
      .get(ORDERS_API)
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]));
    // eslint-disable-next-line
  }, []);

  /* =======================
     PRODUCT HANDLERS
  ======================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const resetProductForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "",
      price: "",
      description: "",
      sizes: [],
      inStock: true,
    });
    setImage(null);
  };

  const submitProductForm = async (e) => {
    e.preventDefault();

    if (!editingId && !image) {
      alert("Image is required for new products.");
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("category", form.category);
    data.append("price", form.price);
    data.append("description", form.description);
    data.append("sizes", JSON.stringify(form.sizes));
    data.append("inStock", String(form.inStock));
    if (image) data.append("image", image);

    if (editingId) {
      await axios.put(`${PRODUCTS_API}/${editingId}`, data);
    } else {
      await axios.post(PRODUCTS_API, data);
    }

    resetProductForm();
    fetchProducts();
  };

  const editProduct = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || "",
      category: p.category || "",
      price: p.price ?? "",
      description: p.description || "",
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      inStock: p.inStock !== false,
    });
    setImage(null);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`${PRODUCTS_API}/${id}`);
    fetchProducts();
  };

  /* =======================
     CATEGORY HANDLERS
  ======================= */
  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) return;
    setCategories([...categories, newCategory]);
    setNewCategory("");
  };

  const deleteCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
    if (form.category === cat) {
      setForm({ ...form, category: "" });
    }
  };

  /* =======================
     USER HANDLERS
  ======================= */
  const startEditUser = (u) => {
    setUserEditId(u._id);
    setUserForm({
      name: u.name,
      email: u.email,
      role: u.role,
    });
  };

  const cancelEditUser = () => {
    setUserEditId(null);
    setUserForm({ name: "", email: "", role: "user" });
  };

  const handleUserChange = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const updateUser = async (e) => {
    e.preventDefault();
    await axios.put(`${USERS_API}/${userEditId}`, userForm, authHeaders);
    cancelEditUser();
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await axios.delete(`${USERS_API}/${id}`, authHeaders);
    fetchUsers();
  };

  /* =======================
     ORDERS + SALES ANALYTICS
  ======================= */
  const userOrderMap = orders.reduce((acc, order) => {
    const userName = order?.user?.name || "Unknown User";
    const userEmail = order?.user?.email || "No email";
    const key = `${userName}__${userEmail}`;
    if (!acc[key]) {
      acc[key] = {
        userName,
        userEmail,
        orders: [],
      };
    }
    acc[key].orders.push(order);
    return acc;
  }, {});
  const groupedOrders = Object.values(userOrderMap).sort((a, b) =>
    a.userName.localeCompare(b.userName)
  );

  const soldByItemMap = orders.reduce((acc, order) => {
    (order.items || []).forEach((item) => {
      const itemName = item?.name || "Unnamed Item";
      const qty = Number(item?.quantity || 0);
      if (!acc[itemName]) acc[itemName] = 0;
      acc[itemName] += qty;
    });
    return acc;
  }, {});
  const soldItems = Object.entries(soldByItemMap)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
  const topSoldItems = soldItems.slice(0, 10);
  const maxSoldCount = topSoldItems[0]?.quantity || 1;

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="min-h-screen bg-latte px-12 py-14">
      <h1 className="text-4xl font-serif text-cocoa mb-8">
        Admin Dashboard
      </h1>

      {/* TABS */}
      <div className="flex gap-4 mb-10">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded ${
            tab === "products"
              ? "bg-mocha text-latte"
              : "bg-beige text-cocoa"
          }`}
        >
          Product Management
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded ${
            tab === "users"
              ? "bg-mocha text-latte"
              : "bg-beige text-cocoa"
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded ${
            tab === "orders"
              ? "bg-mocha text-latte"
              : "bg-beige text-cocoa"
          }`}
        >
          Orders & Sales
        </button>
      </div>

      {/* ================= PRODUCTS TAB ================= */}
      {tab === "products" && (
        <>
          {/* CATEGORY MANAGER */}
          <div className="bg-beige p-6 rounded-xl mb-10 max-w-xl">
            <h2 className="text-xl text-cocoa mb-4">
              Manage Categories
            </h2>

            <div className="flex gap-3 mb-4">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="flex-1 p-2 rounded"
              />
              <button
                type="button"
                onClick={addCategory}
                className="bg-mocha text-latte px-4 py-2 rounded"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="bg-latte px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span className="text-sm text-cocoa">{cat}</span>
                  <button
                    onClick={() => deleteCategory(cat)}
                    className="text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT FORM */}
          <form
            onSubmit={submitProductForm}
            className="bg-beige p-6 rounded-xl mb-12 max-w-xl"
          >
            <h2 className="text-xl text-cocoa mb-4">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              className="w-full mb-3 p-2 rounded"
              required
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="w-full mb-3 p-2 rounded"
              required
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full mb-3 p-2 rounded"
              rows={3}
            />

            {/* SIZES */}
            <div className="mb-3">
              <p className="text-sm text-cocoa mb-2">
                Available sizes
              </p>
              <div className="flex gap-4">
                {SIZE_OPTIONS.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 text-sm text-cocoa"
                  >
                    <input
                      type="checkbox"
                      checked={form.sizes.includes(s)}
                      onChange={() => toggleSize(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* STOCK */}
            <label className="flex items-center gap-2 text-sm text-cocoa mb-3">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) =>
                  setForm({ ...form, inStock: e.target.checked })
                }
              />
              In stock
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full mb-4"
              required={!editingId}
            />

            <div className="flex gap-3">
              <button className="bg-mocha text-latte px-6 py-2 rounded">
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="bg-latte text-cocoa px-6 py-2 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* PRODUCT LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div key={p._id} className="bg-beige p-5 rounded-xl">
                <h3 className="text-lg text-cocoa font-medium">
                  {p.name}
                </h3>
                <p className="text-sm text-cocoa">
                  {p.category} • ${p.price}
                </p>
                <p className="text-sm text-cocoa mt-2">
                  {p.description}
                </p>
                <p className="text-sm text-cocoa mt-2">
                  sizes: {(p.sizes || []).join(", ") || "N/A"}
                </p>
                <p className="text-sm text-cocoa">
                  stock: {p.inStock ? "in stock" : "out of stock"}
                </p>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => editProduct(p)}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= USERS TAB ================= */}
      {tab === "users" && (
        <>
          {userEditId && (
            <form
              onSubmit={updateUser}
              className="bg-beige p-6 rounded-xl mb-10 max-w-xl"
            >
              <h2 className="text-xl text-cocoa mb-4">
                Edit User
              </h2>

              <input
                name="name"
                value={userForm.name}
                onChange={handleUserChange}
                className="w-full mb-3 p-2 rounded"
                required
              />

              <input
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleUserChange}
                className="w-full mb-3 p-2 rounded"
                required
              />

              <select
                name="role"
                value={userForm.role}
                onChange={handleUserChange}
                className="w-full mb-4 p-2 rounded"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <div className="flex gap-3">
                <button className="bg-mocha text-latte px-6 py-2 rounded">
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEditUser}
                  className="bg-latte text-cocoa px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-beige p-5 rounded-xl flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg text-cocoa font-medium">
                    {u.name}
                  </h3>
                  <p className="text-sm text-cocoa">{u.email}</p>
                  <p className="text-sm text-cocoa">
                    role: {u.role}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => startEditUser(u)}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= ORDERS TAB ================= */}
      {tab === "orders" && (
        <div className="space-y-8">
          <section className="bg-beige p-6 rounded-xl">
            <h2 className="text-xl text-cocoa mb-4">
              Items Sold (Graph)
            </h2>
            {topSoldItems.length === 0 ? (
              <p className="text-cocoa">No sales yet.</p>
            ) : (
              <div className="space-y-3">
                {topSoldItems.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm text-cocoa">
                      <span className="truncate max-w-[70%]">{item.name}</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="h-3 rounded bg-latte overflow-hidden">
                      <div
                        className="h-full bg-mocha"
                        style={{
                          width: `${Math.max(
                            8,
                            (Number(item.quantity || 0) / maxSoldCount) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-beige p-6 rounded-xl">
            <h2 className="text-xl text-cocoa mb-4">
              Order History by User
            </h2>
            {groupedOrders.length === 0 ? (
              <p className="text-cocoa">No orders placed yet.</p>
            ) : (
              <div className="space-y-6">
                {groupedOrders.map((group) => (
                  <div key={`${group.userName}-${group.userEmail}`} className="border border-cocoa/15 rounded-lg p-4 bg-latte">
                    <p className="text-cocoa font-medium">{group.userName}</p>
                    <p className="text-sm text-cocoa/75 mb-3">{group.userEmail}</p>

                    <div className="space-y-3">
                      {group.orders
                        .sort(
                          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )
                        .map((order) => (
                          <div
                            key={order._id}
                            className="border border-cocoa/15 rounded-md p-3 bg-beige"
                          >
                            <p className="text-sm text-cocoa/80 break-all">
                              Order ID: {order._id}
                            </p>
                            <p className="text-sm text-cocoa/80">
                              Date: {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-cocoa/80 mb-2">
                              Total: ${Number(order.totalAmount || 0).toFixed(2)}
                            </p>

                            <div className="space-y-1">
                              {(order.items || []).map((item, idx) => (
                                <p
                                  key={`${order._id}-${item.productId || item.name}-${idx}`}
                                  className="text-sm text-cocoa"
                                >
                                  {item.name} x {Number(item.quantity || 1)}
                                  {item.size ? ` (Size: ${item.size})` : ""} - $
                                  {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
