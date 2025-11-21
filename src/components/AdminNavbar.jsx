import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      icon: <ShoppingCart size={20} />,
    },
  ];

  return (
    <aside className="w-64 bg-dark text-light flex flex-col justify-between shadow-card">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="p-6 border-b border-light/10">
          <h1 className="font-serif text-2xl font-semibold text-primary">
            GoPrish
          </h1>
          <p className="text-sm text-light/60">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
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

      {/* Bottom - Logout */}
      <div className="p-6 border-t border-light/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-light py-2 rounded-lg shadow-card transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar;
