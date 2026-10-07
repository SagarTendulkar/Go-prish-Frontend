import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import validatePassword from "../utils/validatePassword";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        const { errors } = validatePassword(e.target.value);
        setPasswordErrors(errors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { isValid } = validatePassword(password);
        if (!isValid) return;

        if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post(`/auth/reset-password/${token}`, {
                password,
            });
            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Link expired. Please request a new one.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh] bg-surface">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-brand-dark">
                    Reset Your Password
                </h2>

                {/* New Password */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand
              ${passwordErrors.length > 0 ? "border-red-400" : "border-gray-300"}`}
                        required
                        placeholder="Enter new password"
                    />
                    {/* password rules */}
                    {password && (
                        <div className="mt-2 flex flex-col gap-1">
                            {[
                                {
                                    test: password.length >= 8,
                                    label: "At least 8 characters",
                                },
                                {
                                    test: /[A-Z]/.test(password),
                                    label: "One uppercase letter",
                                },
                                {
                                    test: /[0-9]/.test(password),
                                    label: "One number",
                                },
                            ].map((rule, i) => (
                                <span
                                    key={i}
                                    className={`text-xs flex items-center gap-1.5 transition-colors duration-200
                    ${rule.test ? "text-green-500" : "text-red-400"}`}
                                >
                                    {rule.test ? "✓" : "✗"} {rule.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand
              ${confirm && confirm !== password ? "border-red-400" : "border-gray-300"}`}
                        required
                        placeholder="Confirm new password"
                    />
                    {confirm && confirm !== password && (
                        <p className="text-xs text-red-500 mt-1">
                            ✗ Passwords do not match
                        </p>
                    )}
                    {confirm && confirm === password && password.length > 0 && (
                        <p className="text-xs text-green-500 mt-1">
                            ✓ Passwords match
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={
                        loading ||
                        passwordErrors.length > 0 ||
                        password !== confirm
                    }
                    className="w-full bg-brand text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
