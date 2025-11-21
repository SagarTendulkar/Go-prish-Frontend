import AdminNavbar from "../../components/AdminNavbar";
import { Outlet } from "react-router-dom";
import "../../styles/admin.css";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-light font-sans text-dark">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-secondary/30 overflow-y-auto">
        <Outlet />
      </main>

      {/* ✅ Toast container (must be inside App but outside Outlet) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
};

export default AdminLayout;
