import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import {
  ChevronDown,
  ShoppingCart,
  Heart,
  LogOut,
  Search,
  Menu,
  X,
  Package,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoverDropdown, setHoverDropdown] = useState(null);
  const [activeParent, setActiveParent] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ── Fetch categories ──────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // ── Scroll shadow ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Lock body scroll when mobile menu open ────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ── Close on route change ─────────────────────────────────
  useEffect(() => {
    setMenuOpen(false);
    setActiveParent(null);
    setSearchOpen(false);
  }, [location.pathname]);

  // ── Derived ───────────────────────────────────────────────
  const parentCategories = categories.filter((c) => !c.parentCategory);
  const childCategories = categories.filter((c) => c.parentCategory);
  const currentCategory = categories.find((c) => c.slug === slug);
  const currentParentId = currentCategory?.parentCategory?._id || null;
  const isActive = (path) => location.pathname === path;

  // ── Handlers ─────────────────────────────────────────────
  const handleSearch = (val) => {
    const q = val.trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
    setSearchVal("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleCategoryClick = (s) => {
    navigate(`/category/${s}`);
    setMenuOpen(false);
    setHoverDropdown(null);
    setActiveParent(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav
        className={`sticky top-0 z-50 border-b border-[#d2af9b]/20 backdrop-blur-lg bg-[#fdf8f4]/90 transition-shadow duration-300
          ${scrolled ? "shadow-[0_4px_32px_rgba(170,110,70,0.09)]" : "shadow-none"}`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4 lg:gap-6">
          {/* ── LOGO ──────────────────────────── */}
          <div
            onClick={() => navigate("/")}
            className="shrink-0 cursor-pointer"
          >
            <img
              src={logo}
              alt="GoPrish"
              className="h-11 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* ── DESKTOP SEARCH ────────────────── */}
          <div className="relative hidden md:flex flex-1 max-w-[300px]">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchVal)}
              placeholder="Search styles…"
              className="w-full h-[38px] pl-4 pr-9 rounded-full border border-[#c97a4a]/25 bg-[#fff5ee]/70 text-[#3d2b1f] text-md placeholder-[#b89a88] outline-none transition-all duration-200 focus:border-[#c97a4a] focus:bg-white focus:ring-4 focus:ring-[#c97a4a]/10"
            />
            <button
              onClick={() => handleSearch(searchVal)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c97a4a] flex items-center bg-transparent border-none cursor-pointer"
            >
              <Search size={15} />
            </button>
          </div>

          {/* ── DESKTOP NAV LINKS ─────────────── */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-md transition-all duration-200 no-underline
                ${
                  isActive("/")
                    ? "font-medium text-[#c97a4a] bg-[#c97a4a]/[0.08]"
                    : "font-normal text-[#5a3e32] hover:text-[#c97a4a] hover:bg-[#c97a4a]/[0.06]"
                }`}
            >
              Home
            </Link>

            {parentCategories.map((parent) => {
              const isActiveParent = currentParentId === parent._id;
              const isOpen = hoverDropdown === parent._id;
              const children = childCategories.filter(
                (c) => c.parentCategory?._id === parent._id,
              );
              return (
                <div
                  key={parent._id}
                  className="relative"
                  onMouseEnter={() => setHoverDropdown(parent._id)}
                  onMouseLeave={() => setHoverDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-md border-none cursor-pointer transition-all duration-200
                      ${
                        isActiveParent || isOpen
                          ? "font-medium text-[#c97a4a] bg-[#c97a4a]/[0.08]"
                          : "font-normal text-[#5a3e32] hover:text-[#c97a4a] hover:bg-[#c97a4a]/[0.06] bg-transparent"
                      }`}
                  >
                    {parent.name}
                    <ChevronDown
                      size={13}
                      className={`opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Invisible bridge — fills gap between trigger and dropdown so mouseLeave doesn't fire mid-hover */}
                  <div className="absolute top-full left-0 w-full h-4" />

                  {/* Dropdown */}
                  <div
                    className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[400px] bg-[#fffaf6]/95 backdrop-blur-xl border border-[#d2aa91]/20 rounded-[20px] p-[18px] shadow-[0_20px_60px_rgba(140,90,60,0.13)] z-[100] transition-all duration-[280ms]
                      ${
                        isOpen
                          ? "opacity-100 pointer-events-auto translate-y-0"
                          : "opacity-0 pointer-events-none translate-y-2"
                      }`}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[1.6px] text-[#c97a4a] mb-3 px-1">
                      Shop {parent.name}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {children.map((child) => (
                        <button
                          key={child._id}
                          onClick={() => handleCategoryClick(child.slug)}
                          className="flex flex-col items-center gap-2 py-2.5 px-1.5 rounded-[14px] border border-transparent bg-transparent cursor-pointer transition-all duration-200 hover:bg-[#c97a4a]/[0.07] hover:border-[#c97a4a]/20 hover:-translate-y-0.5"
                        >
                          {child.image ? (
                            <img
                              src={child.image}
                              alt={child.name}
                              className="w-14 h-14 rounded-xl object-cover border border-[#d2aa91]/25"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#e4b99b]/20 flex items-center justify-center text-2xl border border-[#d2aa91]/20">
                              👕
                            </div>
                          )}
                          <span className="text-[12px] font-medium text-[#4a3228] text-center leading-tight">
                            {child.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              to="/about"
              className={`px-3.5 py-1.5 rounded-full text-md transition-all duration-200 no-underline
                ${
                  isActive("/about")
                    ? "font-medium text-[#c97a4a] bg-[#c97a4a]/[0.08]"
                    : "font-normal text-[#5a3e32] hover:text-[#c97a4a] hover:bg-[#c97a4a]/[0.06]"
                }`}
            >
              About
            </Link>
          </div>

          {/* ── DESKTOP ICONS + AUTH ───────────── */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link
              to="/wishlist"
              title="Wishlist"
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 no-underline
                ${
                  isActive("/wishlist")
                    ? "text-[#c97a4a] bg-[#c97a4a]/10"
                    : "text-[#5a3e32] hover:text-[#c97a4a] hover:bg-[#c97a4a]/10"
                }`}
            >
              <Heart size={19} />
            </Link>

            <Link
              to="/cart"
              title="Cart"
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 no-underline
                ${
                  isActive("/cart")
                    ? "text-[#c97a4a] bg-[#c97a4a]/10"
                    : "text-[#5a3e32] hover:text-[#c97a4a] hover:bg-[#c97a4a]/10"
                }`}
            >
              <ShoppingCart size={19} />
            </Link>

            {!user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-[18px] py-[7px] rounded-full text-[13px] font-medium text-[#c97a4a] bg-[#c97a4a]/[0.08] border border-[#c97a4a]/30 no-underline transition-all duration-200 hover:bg-[#c97a4a] hover:text-white hover:border-[#c97a4a] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(201,122,74,0.3)]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-[18px] py-[7px] rounded-full text-[13px] font-medium text-white bg-[#3d2b1f] border border-[#3d2b1f] no-underline transition-all duration-200 hover:bg-[#c97a4a] hover:border-[#c97a4a] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(201,122,74,0.35)]"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div
                className="relative ml-2"
                onMouseEnter={() => setHoverDropdown("user")}
                onMouseLeave={() => setHoverDropdown(null)}
              >
                {/* Avatar */}
                <div
                  title={user.name || "Account"}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#e8c9b0] to-[#d4956a] flex items-center justify-center text-[13px] font-semibold text-white cursor-pointer select-none transition-all duration-200 border-2
                    ${hoverDropdown === "user" ? "border-[#c97a4a] scale-105" : "border-[#c97a4a]/30"}`}
                >
                  {initials}
                </div>

                {/* Invisible bridge — fills gap between avatar and dropdown */}
                <div className="absolute top-full right-0 w-full h-4" />

                {/* User dropdown */}
                <div
                  className={`absolute right-0 top-[calc(100%+12px)] w-48 bg-[#fffaf6]/95 backdrop-blur-xl border border-[#d2aa91]/20 rounded-2xl p-2 shadow-[0_16px_48px_rgba(140,90,60,0.13)] z-[100] transition-all duration-[250ms]
                    ${
                      hoverDropdown === "user"
                        ? "opacity-100 pointer-events-auto translate-y-0"
                        : "opacity-0 pointer-events-none translate-y-1.5"
                    }`}
                >
                  <div className="px-3 py-2 pb-2.5 border-b border-[#d2aa91]/20 mb-1">
                    <p className="text-[13px] font-medium text-[#3d2b1f]">
                      {user?.name || "Hey there!"}
                    </p>
                    {/* <p className="text-[11px] text-[#b89a88] mt-0.5 truncate">
                      {user?.email}
                    </p> */}
                  </div>
                  <Link
                    to="/orderHistory"
                    className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] text-[#5a3e32] no-underline my-0.5 transition-colors duration-150 hover:bg-[#c97a4a]/[0.08] hover:text-[#c97a4a]"
                  >
                    <Package size={14} /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-[10px] text-[13px] text-[#5a3e32] bg-transparent border-none cursor-pointer mt-0.5 transition-colors duration-150 hover:bg-[#c97a4a]/[0.08] hover:text-[#c97a4a]"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── MOBILE RIGHT ICONS ─────────────── */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setSearchOpen((p) => !p)}
              className={`w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border-none transition-colors duration-200 cursor-pointer
                ${searchOpen ? "bg-[#c97a4a]/10 text-[#c97a4a]" : "bg-transparent text-[#5a3e32]"}`}
            >
              <Search size={18} />
            </button>

            <Link
              to="/cart"
              className="w-[38px] h-[38px] flex items-center justify-center rounded-[10px] text-[#5a3e32] no-underline"
            >
              <ShoppingCart size={18} />
            </Link>

            <button
              onClick={() => setMenuOpen((p) => !p)}
              className={`w-[38px] h-[38px] flex items-center justify-center rounded-[10px] border-none cursor-pointer transition-colors duration-200
                ${menuOpen ? "bg-[#c97a4a]/10" : "bg-transparent"}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={20} className="text-[#c97a4a]" />
              ) : (
                <Menu size={20} className="text-[#5a3e32]" />
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE SEARCH SLIDE DOWN ───────── */}
        <div
          className={`overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-[70px] border-t border-[#d2af9b]/15" : "max-h-0"}`}
        >
          <div className="px-4 sm:px-6 py-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchVal)}
                placeholder="Search styles…"
                autoFocus={searchOpen}
                className="w-full h-10 pl-4 pr-10 rounded-full border border-[#c97a4a]/25 bg-[#fff5ee]/80 text-[#3d2b1f] text-sm placeholder-[#b89a88] outline-none"
              />
              <button
                onClick={() => handleSearch(searchVal)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#c97a4a] flex items-center"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          MOBILE FULL-SCREEN MENU
      ══════════════════════════════════════ */}
      <div
        className={`fixed inset-0 top-[68px] z-40 bg-[#fdf8f4]/97 backdrop-blur-xl overflow-y-auto p-5 flex flex-col gap-1 transition-transform duration-[350ms]
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Static nav links */}
        {[
          { to: "/", label: "Home" },
          { to: "/about", label: "About" },
          { to: "/cart", label: "Cart" },
          { to: "/wishlist", label: "Wishlist" },
        ].map(({ to, label }, i) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
            style={{ transitionDelay: `${0.04 + i * 0.05}s` }}
            className={`block px-4 py-3 text-[22px] font-serif rounded-[14px] no-underline transition-all duration-200
              ${isActive(to) ? "text-[#c97a4a] bg-[#c97a4a]/[0.07]" : "text-[#3d2b1f] hover:text-[#c97a4a] hover:pl-6"}
              ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"}`}
          >
            {label}
          </Link>
        ))}

        {/* Category accordions */}
        {parentCategories.map((parent, i) => (
          <div key={parent._id}>
            <button
              onClick={() =>
                setActiveParent(activeParent === parent._id ? null : parent._id)
              }
              style={{ transitionDelay: `${0.04 + (4 + i) * 0.05}s` }}
              className={`flex items-center justify-between w-full px-4 py-3 text-[22px] font-serif rounded-[14px] border-none cursor-pointer text-left transition-all duration-200
                ${activeParent === parent._id ? "text-[#c97a4a] bg-[#c97a4a]/[0.07]" : "text-[#3d2b1f] bg-transparent"}
                ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"}`}
            >
              {parent.name}
              <ChevronDown
                size={18}
                className={`flex-shrink-0 transition-transform duration-200 ${activeParent === parent._id ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${activeParent === parent._id ? "max-h-[400px]" : "max-h-0"}`}
            >
              <div className="grid grid-cols-2 gap-2 p-2 pb-3">
                {childCategories
                  .filter((c) => c.parentCategory?._id === parent._id)
                  .map((child) => (
                    <button
                      key={child._id}
                      onClick={() => handleCategoryClick(child.slug)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#e4b99b]/10 border border-[#d2aa91]/20 cursor-pointer text-sm font-medium text-[#4a3228] text-left transition-colors duration-200 hover:bg-[#c97a4a]/10"
                    >
                      {child.image ? (
                        <img
                          src={child.image}
                          alt={child.name}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <span className="text-xl flex-shrink-0">👕</span>
                      )}
                      {child.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ))}

        <div className="h-px bg-[#d2aa91]/20 my-3" />

        {/* Mobile auth */}
        {!user ? (
          <div
            className={`flex gap-3 transition-all duration-300 delay-[350ms] ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 py-3 rounded-[14px] text-[15px] font-medium text-center text-[#c97a4a] bg-[#c97a4a]/[0.08] border border-[#c97a4a]/30 no-underline"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="flex-1 py-3 rounded-[14px] text-[15px] font-medium text-center text-white bg-[#3d2b1f] border border-[#3d2b1f] no-underline"
            >
              Register
            </Link>
          </div>
        ) : (
          <div
            className={`transition-all duration-300 delay-[350ms] ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-[#e4b99b]/10 rounded-[14px] mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8c9b0] to-[#d4956a] flex items-center justify-center text-[14px] font-semibold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-[15px] font-medium text-[#3d2b1f] truncate">
                  {user?.name}
                </p>
                <p className="text-[12px] text-[#b89a88] truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <Link
              to="/orderHistory"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] text-[#5a3e32] no-underline mb-1 transition-colors duration-150 hover:bg-[#c97a4a]/[0.08] hover:text-[#c97a4a]"
            >
              <Package size={16} /> My Orders
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[15px] font-medium text-[#c97a4a] bg-[#c97a4a]/[0.07] border-none cursor-pointer transition-colors duration-150 hover:bg-[#c97a4a]/[0.12]"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
