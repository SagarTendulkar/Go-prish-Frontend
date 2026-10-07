import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import validatePassword from "../utils/validatePassword";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "newPassword") {
            const { errors } = validatePassword(value);
            setPasswordErrors(errors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { isValid } = validatePassword(formData.newPassword);
        if (!isValid) return;

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post("/auth/change-password", {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            toast.success(res.data.message);
            navigate("/");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to change password",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-surface">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-md"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                        <KeyRound size={18} className="text-brand" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark">
                        Change Password
                    </h2>
                </div>

                {/* Current Password */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Current Password
                    </label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        required
                        placeholder="Enter current password"
                    />
                </div>

                {/* New Password */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand
              ${passwordErrors.length > 0 ? "border-red-400" : "border-gray-300"}`}
                        required
                        placeholder="Enter new password"
                    />
                    {/* password rules */}
                    {formData.newPassword && (
                        <div className="mt-2 flex flex-col gap-1">
                            {[
                                {
                                    test: formData.newPassword.length >= 8,
                                    label: "At least 8 characters",
                                },
                                {
                                    test: /[A-Z]/.test(formData.newPassword),
                                    label: "One uppercase letter",
                                },
                                {
                                    test: /[0-9]/.test(formData.newPassword),
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
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand
              ${
                  formData.confirmPassword &&
                  formData.confirmPassword !== formData.newPassword
                      ? "border-red-400"
                      : "border-gray-300"
              }`}
                        required
                        placeholder="Confirm new password"
                    />
                    {formData.confirmPassword &&
                        formData.confirmPassword !== formData.newPassword && (
                            <p className="text-xs text-red-500 mt-1">
                                ✗ Passwords do not match
                            </p>
                        )}
                    {formData.confirmPassword &&
                        formData.confirmPassword === formData.newPassword && (
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
                        formData.newPassword !== formData.confirmPassword
                    }
                    className="w-full bg-brand text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
