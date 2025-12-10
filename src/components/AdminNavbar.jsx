import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  ListChevronsUpDown,
} from "lucide-react";
import { useState } from "react";

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <ListChevronsUpDown size={20} />,
    },
  ];

  // Sidebar JSX for reuse
  const Sidebar = (
    <div className="bg-dark text-light flex flex-col justify-between shadow-card h-full w-64">
      <div>
        <div className="p-6 border-b border-light/10">
          <h1 className="font-serif text-2xl font-semibold text-primary">
            GoPrish
          </h1>
          <p className="text-sm text-light/60">Admin Panel</p>
        </div>

        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setDrawerOpen(false)} // close drawer when navigating mobile
                className={`flex items-center gap-3 px-6 py-2.5 rounded-lg mx-3 transition-colors duration-200 ${
                  active
                    ? "bg-primary text-light shadow-soft"
                    : "hover:bg-accent/30 hover:text-dark"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-light/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-light py-2 rounded-lg shadow-card transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64">{Sidebar}</aside>

      {/* Mobile Top Nav */}
      <header className="lg:hidden bg-dark text-light px-4 py-3 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-primary">
          GoPrish Admin
        </h1>
        <button onClick={() => setDrawerOpen(true)}>
          <Menu size={26} />
        </button>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="w-full bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="bg-dark text-light w-64 h-full shadow-xl relative animate-slideInRight">
            <button
              className="absolute top-4 right-4 text-light"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={26} />
            </button>
            {Sidebar}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
