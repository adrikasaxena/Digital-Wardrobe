import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/logout");
  };

  return (
    <nav className="sticky top-0 z-50 bg-mocha text-latte px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-serif">Digital Wardrobe</h1>

      <div className="flex items-center gap-6">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/search">Search</Link>
        <Link to="/about">About</Link>

        {user && <Link to="/cart">Cart</Link>}
        {user && <Link to="/wishlist">Wishlist</Link>}
        {user && <Link to="/saved-outfits">Saved Outfits</Link>}

        {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            <Link to="/profile">My Account</Link>
            <button onClick={handleLogout} className="text-sm hover:underline">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
