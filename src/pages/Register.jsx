import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import validatePassword from "@/utils/validatePassword";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordErrors, setPasswordErrors] = useState([]);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            const { errors } = validatePassword(value);
            setPasswordErrors(errors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const { isValid, errors } = validatePassword(formData.password);
        if (!isValid) {
            setPasswordErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post(
                "/auth/registerUser",
                formData,
            );
            const { user, token } = res.data;

            // ✅ Update context
            login(user, token);

            navigate("/"); // redirect to home
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Registration failed. Try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh] bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Create Your Account
                </h2>

                {error && (
                    <p className="text-red-500 bg-red-50 p-2 rounded-md mb-4 text-center">
                        {error}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                        placeholder="Enter your name"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                        placeholder="Enter your password"
                    />

                    {formData.password && (
                        <div className="mt-2 flex flex-col gap-1">
                            {[
                                {
                                    test: formData.password.length >= 8,
                                    label: "At least 8 characters",
                                },
                                {
                                    test: /[A-Z]/.test(formData.password),
                                    label: "One uppercase letter",
                                },
                                {
                                    test: /[0-9]/.test(formData.password),
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

                <button
                    type="submit"
                    disabled={loading || passwordErrors.length > 0}
                    className="w-full bg-yellow-600 text-white font-semibold py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>

                <p className="text-center text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-yellow-600 font-medium">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
