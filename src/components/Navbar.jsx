import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import {
  Menu,
  X,
  ChevronDown,
  ShoppingCart,
  Heart,
  User,
  LogOut,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoverDropdown, setHoverDropdown] = useState(null); // desktop hover
  const [activeParent, setActiveParent] = useState(null); // mobile click
  const { slug } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // 🔒 Prevent background scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const parentCategories = categories.filter((cat) => !cat.parentCategory);
  const childCategories = categories.filter((cat) => cat.parentCategory);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug}`);
    setMenuOpen(false);
    setHoverDropdown(null);
    setActiveParent(null);
  };

  const isActive = (path) => location.pathname === path;

  // 🧭 detect current category from URL
  const currentCategory = categories.find((cat) => cat.slug === slug);
  const currentParentId = currentCategory?.parentCategory?._id || null;

  return (
    <nav className="bg-light/80 backdrop-blur-lg border-b border-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer"
          >
            <img
              src={logo}
              alt="GoPrish Logo"
              className="h-15 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* 🔍 Desktop Search */}
          <div className="hidden md:flex relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-56 px-4 py-2 border border-accent/40 rounded-lg 
               focus:outline-none focus:ring-1 focus:ring-primary 
               focus:border-primary transition-all duration-200 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(
                    `/search?query=${encodeURIComponent(e.target.value.trim())}`
                  );
                  e.target.value = "";
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.closest("div").querySelector("input");
                if (input && input.value.trim()) {
                  navigate(
                    `/search?query=${encodeURIComponent(input.value.trim())}`
                  );
                  input.value = "";
                }
              }}
              className="absolute right-2 top-2 text-gray-500 hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M16.65 10.75a5.9 5.9 0 11-11.8 0 5.9 5.9 0 0111.8 0z"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isActive("/")
                  ? "text-primary bg-primary/10"
                  : "text-dark hover:text-primary hover:bg-accent/20"
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            {parentCategories.map((parent) => (
              <div
                key={parent._id}
                className="relative"
                onMouseEnter={() => setHoverDropdown(parent._id)}
                onMouseLeave={() => setHoverDropdown(null)}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                    hoverDropdown === parent._id ||
                    currentParentId === parent._id
                      ? "text-primary bg-primary/10"
                      : "text-dark hover:text-primary hover:bg-accent/20"
                  }`}
                >
                  {parent.name}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      hoverDropdown === parent._id ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {hoverDropdown === parent._id && (
                  <div className="absolute -left-10 top-full w-96 bg-light border border-accent/30 rounded-xl shadow-soft backdrop-blur-lg z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {childCategories
                        .filter(
                          (child) => child.parentCategory?._id === parent._id
                        )
                        .map((child) => (
                          <button
                            key={child._id}
                            onClick={() => handleCategoryClick(child.slug)}
                            className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-accent/30 group text-left w-full"
                          >
                            {child.image ? (
                              <img
                                src={child.image}
                                alt={child.name}
                                className="w-12 h-12 object-cover rounded-lg border border-accent/40 group-hover:border-primary/50 transition"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-dark/40 border border-accent/40">
                                👕
                              </div>
                            )}
                            <span className="text-dark font-medium text-sm group-hover:text-primary">
                              {child.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/cart"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isActive("/cart")
                  ? "text-primary bg-primary/10"
                  : "text-dark hover:text-primary hover:bg-accent/20"
              }`}
            >
              <ShoppingCart size={18} />
              Cart
            </Link>

            <Link
              to="/wishlist"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isActive("/wishlist")
                  ? "text-primary bg-primary/10"
                  : "text-dark hover:text-primary hover:bg-accent/20"
              }`}
            >
              <Heart size={18} />
              Wishlist
            </Link>

            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isActive("/about")
                  ? "text-primary bg-primary/10"
                  : "text-dark hover:text-primary hover:bg-accent/20"
              }`}
            >
              About
            </Link>
          </div>

          {/* User / Auth (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-dark font-medium hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-primary text-light font-medium rounded-lg hover:shadow-soft transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  Register
                </Link>
              </>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setHoverDropdown("user")}
                onMouseLeave={() => setHoverDropdown(null)}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-dark hover:text-primary hover:bg-accent/20 cursor-pointer">
                  <User size={18} />
                  Account
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      hoverDropdown === "user" ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {hoverDropdown === "user" && (
                  <div className="absolute right-0 top-full w-48 bg-light border border-accent/30 rounded-xl shadow-soft z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-dark/60 border-b border-accent/20">
                        {user?.name || user?.email || "User"}
                      </div>
                      <Link
                        to="/orderHistory"
                        className="block px-3 py-2 my-1 text-sm text-dark hover:bg-accent/30 rounded-lg hover:text-primary"
                      >
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark hover:bg-accent/30 rounded-lg hover:text-primary"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-dark hover:text-primary hover:bg-accent/20 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 📱 Mobile Menu */}
        <div
          className={`lg:hidden transform transition-all duration-300 origin-top ${
            menuOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          } overflow-hidden border-t border-accent/20 bg-light/95 backdrop-blur-lg`}
        >
          {/* Search */}
          <div className="px-4 pt-4 pb-3">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-accent/40 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(
                    `/search?query=${encodeURIComponent(e.target.value.trim())}`
                  );
                  setMenuOpen(false);
                }
              }}
            />
          </div>

          {/* Links */}
          <div className="pb-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 font-medium ${
                isActive("/")
                  ? "text-primary bg-primary/10 border-l-4 border-primary"
                  : "text-dark hover:text-primary hover:bg-accent/20"
              }`}
            >
              Home
            </Link>

            {/* Categories */}
            {parentCategories.map((parent) => (
              <div key={parent._id}>
                <button
                  onClick={() =>
                    setActiveParent(
                      activeParent === parent._id ? null : parent._id
                    )
                  }
                  className={`flex justify-between w-full px-4 py-3 font-medium ${
                    activeParent === parent._id
                      ? "text-primary bg-primary/10"
                      : "text-dark hover:text-primary hover:bg-accent/20"
                  }`}
                >
                  {parent.name}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      activeParent === parent._id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeParent === parent._id && (
                  <div className="bg-accent/10">
                    {childCategories
                      .filter(
                        (child) => child.parentCategory?._id === parent._id
                      )
                      .map((child) => (
                        <button
                          key={child._id}
                          onClick={() => handleCategoryClick(child.slug)}
                          className="flex items-center gap-3 w-full px-8 py-3 text-base font-medium text-dark hover:text-primary hover:bg-accent/20"
                        >
                          {child.image && (
                            <img
                              src={child.image}
                              alt={child.name}
                              className="w-8 h-8 object-cover rounded border border-accent/40"
                            />
                          )}
                          {child.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 font-medium text-dark hover:text-primary hover:bg-accent/20"
            >
              <ShoppingCart size={18} />
              Cart
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 font-medium text-dark hover:text-primary hover:bg-accent/20"
            >
              <Heart size={18} />
              Wishlist
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 font-medium text-dark hover:text-primary hover:bg-accent/20"
            >
              About
            </Link>

            {/* Auth */}
            <div className="border-t border-accent/20 mt-4 pt-4">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-dark font-medium hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block mx-4 mt-2 px-4 py-3 bg-primary text-light font-medium rounded-lg text-center hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-dark font-medium hover:bg-accent/20 hover:text-primary"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
