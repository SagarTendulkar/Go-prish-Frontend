import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Tag,
  Store,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Categories", path: "/admin/categories", icon: Tag },
];

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-brand-deep text-white w-56">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <Store size={16} className="text-white" />
          </div>
          <div>
            <p className="font-serif text-[18px] font-medium text-white leading-none">
              GoPrish
            </p>
            <p className="text-[12px] text-white/40 mt-0.5 tracking-[1.5px] uppercase">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map(({ name, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={name}
              to={path}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200
                ${
                  active
                    ? "bg-brand text-white shadow-[0_4px_12px_rgba(201,122,74,0.35)]"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                }`}
            >
              <Icon
                size={16}
                className={active ? "text-white" : "text-white/50"}
              />
              {name}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-brand/30 flex items-center justify-center text-[14px] font-semibold text-brand shrink-0">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-[14px] font-medium text-white/80 truncate">
                {user.name}
              </p>
              <p className="text-[12px] text-white/35 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 h-screen sticky top-0">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden bg-brand-deep text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <Store size={14} className="text-white" />
          </div>
          <span className="font-serif text-[15px] text-white">
            GoPrish Admin
          </span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-56 h-full shadow-xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X size={15} />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
