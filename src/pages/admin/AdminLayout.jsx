import AdminNavbar from "../../components/AdminNavbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f0ebe5]">
      <AdminNavbar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#3d2b1f",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
};

export default AdminLayout;
