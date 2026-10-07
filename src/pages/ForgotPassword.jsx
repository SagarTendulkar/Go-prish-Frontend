import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await axiosInstance.post("/auth/forgot-password", {
                email,
            });
            setMessage(res.data.message);
        } catch (err) {
            setError("Something went wrong. Please try again.");
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
                <h2 className="text-2xl font-bold mb-2 text-center text-brand-dark">
                    Forgot Password
                </h2>
                <p className="text-center text-ink-muted text-sm mb-6">
                    Enter your email and we'll send you a reset link
                </p>

                {message && (
                    <p className="text-green-600 bg-green-50 p-3 rounded-md mb-4 text-center text-sm">
                        ✓ {message}
                    </p>
                )}
                {error && (
                    <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4 text-center text-sm">
                        {error}
                    </p>
                )}

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        required
                        placeholder="Enter your registered email"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-center text-gray-600 mt-4 text-sm">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="text-brand font-medium hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
