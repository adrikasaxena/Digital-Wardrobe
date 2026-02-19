import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AdminDashboard from "./pages/Admindashboard";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Logout from "./pages/Logout";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import AdminUsers from "./pages/AdminUsers";
import SavedOutfits from "./pages/SavedOutfits";
import SharedOutfit from "./pages/SharedOutfit";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";




/* THIS IS JUST A COMPONENT */
function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInvoicePage = location.pathname === "/order-confirmation";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    // if logged in and trying to access login/signup
    if (
      location.pathname === "/login" ||
      location.pathname === "/signup"
    ) {
      navigate("/profile");
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {!isInvoicePage && <Navbar />}
      <div
        key={location.pathname}
        className="pointer-events-none fixed inset-0 z-[60] bg-latte/90 backdrop-blur-[1px] flex items-center justify-center animate-[routeLoadingOverlay_1.2s_ease_forwards]"
      >
        <div className="rounded-xl bg-beige border border-cocoa/20 px-6 py-5 shadow-sm flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cocoa/80 animate-[loadingDot_0.7s_ease-in-out_infinite]" />
          <span className="h-2.5 w-2.5 rounded-full bg-cocoa/80 animate-[loadingDot_0.7s_ease-in-out_0.15s_infinite]" />
          <span className="h-2.5 w-2.5 rounded-full bg-cocoa/80 animate-[loadingDot_0.7s_ease-in-out_0.3s_infinite]" />
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/order-confirmation"
          element={<OrderConfirmation />}
        />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/about" element={<About />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/saved-outfits" element={<SavedOutfits />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shared-outfit/:shareId" element={<SharedOutfit />} />
        <Route path="/profile" element={<Profile />} />
        

      </Routes>
      {!isInvoicePage && <Footer />}
      <style>{`
        @keyframes routeLoadingOverlay {
          0% { opacity: 1; visibility: visible; }
          75% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }
        @keyframes loadingDot {
          0%, 100% { transform: translateY(0); opacity: 0.45; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
