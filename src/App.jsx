import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ import toast provider
import "./styles/user.css";

function App() {
  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrap">
        <Outlet /> {/* Page content will render here */}
      </div>

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
}

export default App;
